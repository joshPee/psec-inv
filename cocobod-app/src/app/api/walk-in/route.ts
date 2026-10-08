import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function generateRegistrationCode(): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `CTS-${randomNum}`;
}

async function getUniqueCode(): Promise<string> {
  let code = generateRegistrationCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const result = await pool.query('SELECT registration_code FROM participants WHERE registration_code = $1', [code]);
    if (result.rows.length === 0) {
      return code;
    }
    code = generateRegistrationCode();
    attempts++;
  }

  throw new Error('Could not generate unique registration code');
}

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
    const { fullName, organisation, position, phone, isRecurring = false, checkInImmediately = false } = body;

    // Validate input
    if (!fullName || !organisation || !position) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const trimmedName = fullName.trim();
    const trimmedOrg = organisation.trim();
    const trimmedPos = position.trim();

    // Basic validation
    if (trimmedName.length < 2 || trimmedOrg.length < 2 || trimmedPos.length < 2) {
      return NextResponse.json(
        { error: 'Each field must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (/^\d+$/.test(trimmedName) || /^\d+$/.test(trimmedOrg) || /^\d+$/.test(trimmedPos)) {
      return NextResponse.json(
        { error: 'Numbers only are not allowed in any field' },
        { status: 400 }
      );
    }

    // Get event (default to first event or create one)
    let event = await pool.query('SELECT id FROM events LIMIT 1');
    let eventId;
    
    if (event.rows.length === 0) {
      const newEvent = await pool.query(
        `INSERT INTO events (name, date, venue, registration_open)
         VALUES ('COCOBOD Training School Meeting', '2026-08-19', 'COCOBOD Training School', true)
         RETURNING id`
      );
      eventId = newEvent.rows[0].id;
    } else {
      eventId = event.rows[0].id;
    }

    // Generate unique registration code
    const registrationCode = await getUniqueCode();

    // Insert participant
    const result = await pool.query(
      `INSERT INTO participants (
        registration_code, 
        full_name, 
        organisation, 
        position, 
        phone,
        is_recurring,
        event_id,
        registration_source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'WALK_IN')
      RETURNING id, registration_code`,
      [registrationCode, trimmedName, trimmedOrg, trimmedPos, phone || null, isRecurring, eventId]
    );

    const participantId = result.rows[0].id;

    // Check in immediately if requested
    let checkInData = null;
    if (checkInImmediately) {
      const hrUserId = parseInt((session.user as any).id);
      
      try {
        const checkInResult = await pool.query(
          `INSERT INTO check_ins (participant_id, user_id, check_in_time)
           VALUES ($1, $2, NOW())
           ON CONFLICT (participant_id) DO NOTHING
           RETURNING id, check_in_time`,
          [participantId, hrUserId]
        );

        if (checkInResult.rows.length > 0) {
          await pool.query(
            `UPDATE participants
             SET check_in_status = 'CHECKED_IN',
                 check_in_date = NOW(),
                 checked_in_by = $1
             WHERE id = $2`,
            [hrUserId, participantId]
          );

          const hrUser = await pool.query('SELECT name FROM users WHERE id = $1', [hrUserId]);
          
          checkInData = {
            check_in_time: checkInResult.rows[0].check_in_time,
            checked_in_by: hrUser.rows[0]?.name || 'HR Admin'
          };
        }
      } catch (checkInError) {
        console.error('Error during immediate check-in:', checkInError);
        // Continue even if check-in fails
      }
    }

    return NextResponse.json({
      success: true,
      registrationCode: result.rows[0].registration_code,
      participantId,
      checkInData
    });

  } catch (error) {
    console.error('Walk-in registration error:', error);
    return NextResponse.json(
      { error: 'Walk-in registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
