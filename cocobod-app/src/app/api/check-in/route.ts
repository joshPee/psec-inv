import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Get the HR user ID from session
    const hrUserId = parseInt((session.user as any).id);

    // Use a transaction to ensure atomic check-in
    try {
      // First check if participant exists and their current status
      const participant = await sql`
        SELECT id, full_name, registration_code, check_in_status, participant_status, registration_status
        FROM participants
        WHERE id = ${participantId}
      `;

      if (participant.length === 0) {
        return NextResponse.json(
          { error: 'Participant not found' },
          { status: 404 }
        );
      }

      // Only allow check-in for participants who have completed registration
      if (participant[0].registration_status !== 'REGISTERED') {
        return NextResponse.json(
          { error: 'Participant has not completed registration. Please complete registration first.' },
          { status: 400 }
        );
      }

      if (participant[0].check_in_status === 'CHECKED_IN') {
        // Get existing check-in details
        const existingCheckIn = await sql`
          SELECT 
            ci.check_in_time,
            u.name as checked_in_by
          FROM check_ins ci
          JOIN users u ON ci.user_id = u.id
          WHERE ci.participant_id = ${participantId}
        `;

        return NextResponse.json({
          alreadyCheckedIn: true,
          error: 'Participant already checked in',
          check_in_time: existingCheckIn[0]?.check_in_time,
          checked_in_by: existingCheckIn[0]?.checked_in_by
        }, { status: 409 });
      }

      // Insert check-in record with unique constraint
      const checkInResult = await sql`
        INSERT INTO check_ins (participant_id, user_id, check_in_time)
        VALUES (${participantId}, ${hrUserId}, NOW())
        ON CONFLICT (participant_id) DO NOTHING
        RETURNING id, check_in_time
      `;

      if (checkInResult.length === 0) {
        // Another admin checked them in concurrently
        return NextResponse.json({
          alreadyCheckedIn: true,
          error: 'Participant was just checked in by another admin'
        }, { status: 409 });
      }

      // Update participant status
      await sql`
        UPDATE participants
        SET 
          check_in_status = 'CHECKED_IN',
          check_in_date = NOW(),
          checked_in_by = ${hrUserId}
        WHERE id = ${participantId}
      `;

      // Update expected_attendees table if this participant was expected
      await sql`
        UPDATE expected_attendees
        SET 
          check_in_status = 'CHECKED_IN',
          check_in_date = NOW(),
          updated_at = CURRENT_TIMESTAMP
        WHERE participant_id = ${participantId}
      `;

      // Get the HR user name for the response
      const hrUser = await sql`
        SELECT name FROM users WHERE id = ${hrUserId}
      `;

      // Clear cache to reflect updated stats
      clearCache('attendance');

      return NextResponse.json({
        success: true,
        check_in_time: checkInResult[0].check_in_time,
        checked_in_by: hrUser[0]?.name || 'HR Admin',
        participant_name: participant[0].full_name,
        registration_code: participant[0].registration_code
      });

    } catch (dbError) {
      console.error('Database error during check-in:', dbError);
      
      // Check if it's a unique constraint violation
      if (dbError instanceof Error && dbError.message.includes('unique constraint')) {
        return NextResponse.json({
          alreadyCheckedIn: true,
          error: 'Participant already checked in'
        }, { status: 409 });
      }
      
      throw dbError;
    }

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Check-in failed. Please try again.' },
      { status: 500 }
    );
  }
}
