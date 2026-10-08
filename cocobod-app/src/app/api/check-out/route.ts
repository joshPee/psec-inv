import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clearCache } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationCode, guardName, notes } = body;

    console.log('Check-out request body:', body);
    console.log('Registration Code:', registrationCode);

    if (!registrationCode) {
      return NextResponse.json(
        { error: 'Registration code is required' },
        { status: 400 }
      );
    }

    // Use a default user ID for now (can be enhanced later with proper auth)
    const hrUserId = 1;

    // Use a transaction to ensure atomic check-out
    try {
      // First check if participant exists and their current status by registration code
      const participant = await sql`
        SELECT id, full_name, registration_code, check_in_status, check_in_date
        FROM participants
        WHERE registration_code = ${registrationCode}
      `;

      if (participant.length === 0) {
        return NextResponse.json(
          { error: 'Visitor not found' },
          { status: 404 }
        );
      }

      // Only allow check-out for participants who are checked in
      if (participant[0].check_in_status !== 'CHECKED_IN') {
        if (participant[0].check_in_status === 'CHECKED_OUT') {
          return NextResponse.json({
            alreadyCheckedOut: true,
            error: 'Participant already checked out'
          }, { status: 409 });
        }
        return NextResponse.json(
          { error: 'Participant is not checked in' },
          { status: 400 }
        );
      }

      // Insert check-out record with unique constraint
      const checkOutNotes = guardName ? `Checked out by guard: ${guardName}. ${notes || ''}` : (notes || null);
      const checkOutResult = await sql`
        INSERT INTO check_outs (participant_id, user_id, check_out_time, notes)
        VALUES (${participant[0].id}, ${hrUserId}, NOW(), ${checkOutNotes})
        ON CONFLICT (participant_id) DO NOTHING
        RETURNING id, check_out_time
      `;

      if (checkOutResult.length === 0) {
        // Another admin checked them out concurrently
        return NextResponse.json({
          alreadyCheckedOut: true,
          error: 'Participant was just checked out by another admin'
        }, { status: 409 });
      }

      // Update participant status
      await sql`
        UPDATE participants
        SET 
          check_in_status = 'CHECKED_OUT',
          check_out_date = NOW(),
          check_out_by = ${hrUserId}
        WHERE id = ${participant[0].id}
      `;

      // Log the check-out action
      await sql`
        INSERT INTO visitor_logs (participant_id, action, user_id, details, ip_address)
        VALUES (${participant[0].id}, 'CHECK_OUT', ${hrUserId}, ${notes || 'Standard check-out'}, ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null})
      `;

      // Get the HR user name for the response
      const hrUser = await sql`
        SELECT name FROM users WHERE id = ${hrUserId}
      `;

      // Clear cache to reflect updated stats
      clearCache('attendance');

      return NextResponse.json({
        success: true,
        check_out_time: checkOutResult[0].check_out_time,
        checked_out_by: hrUser[0]?.name || 'HR Admin',
        participant_name: participant[0].full_name,
        registration_code: participant[0].registration_code,
        check_in_date: participant[0].check_in_date
      });

    } catch (dbError) {
      console.error('Database error during check-out:', dbError);
      
      // Check if it's a unique constraint violation
      if (dbError instanceof Error && dbError.message.includes('unique constraint')) {
        return NextResponse.json({
          alreadyCheckedOut: true,
          error: 'Participant already checked out'
        }, { status: 409 });
      }
      
      throw dbError;
    }

  } catch (error) {
    console.error('Check-out error:', error);
    return NextResponse.json(
      { error: 'Check-out failed. Please try again.' },
      { status: 500 }
    );
  }
}
