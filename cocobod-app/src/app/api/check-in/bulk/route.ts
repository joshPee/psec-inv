import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clearCache } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { participantIds } = body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid participant IDs' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [session.user.username]);
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    const userId = userResult.rows[0].id;

    // Check if all participants have completed registration
    const participantsCheck = await pool.query(
      `SELECT id, full_name, registration_status 
       FROM participants 
       WHERE id = ANY($1)`,
      [participantIds]
    );

    const notRegistered = participantsCheck.rows.filter(p => p.registration_status !== 'REGISTERED');
    if (notRegistered.length > 0) {
      const notRegisteredNames = notRegistered.map(p => p.full_name).join(', ');
      return NextResponse.json(
        { error: `The following participants have not completed registration: ${notRegisteredNames}` },
        { status: 400 }
      );
    }

    // Bulk check-in participants
    const checkInTime = new Date();
    
    await pool.query(
      `UPDATE participants 
       SET check_in_status = 'CHECKED_IN', 
           check_in_date = $1,
           checked_in_by = $2
       WHERE id = ANY($3) AND check_in_status != 'CHECKED_IN'`,
      [checkInTime, userId, participantIds]
    );

    // Clear cache to reflect updated stats
    clearCache('attendance');

    return NextResponse.json({ success: true, checkedIn: participantIds.length });
  } catch (error) {
    console.error('Error bulk checking in:', error);
    return NextResponse.json(
      { error: 'Failed to bulk check in participants' },
      { status: 500 }
    );
  }
}
