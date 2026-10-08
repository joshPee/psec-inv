import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { clearCache } from '@/lib/db';

// Generate a unique registration code
function generateRegistrationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QCC-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      full_name, 
      organisation, 
      position,
      phone,
      expected_arrival,
      host_name,
      host_department,
      visit_purpose
    } = body;

    console.log('Pre-register request received:', { full_name, organisation, position });

    // Validate input
    if (!full_name || !organisation || !position) {
      console.log('Validation failed: missing required fields');
      return NextResponse.json(
        { error: 'Full name, organisation, and position are required' },
        { status: 400 }
      );
    }

    // Check for duplicate (same name and organisation)
    const duplicateCheck = await pool.query(
      'SELECT id, full_name, organisation FROM participants WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1)) AND LOWER(TRIM(organisation)) = LOWER(TRIM($2))',
      [full_name, organisation]
    );

    console.log('Duplicate check result:', duplicateCheck.rows);
    console.log('Duplicate check count:', duplicateCheck.rows.length);

    if (duplicateCheck.rows.length > 0) {
      console.log('Duplicate found, rejecting:', duplicateCheck.rows[0]);
      return NextResponse.json(
        { error: 'Participant with this name and organisation already exists' },
        { status: 409 }
      );
    }

    // Generate registration code
    const registration_code = generateRegistrationCode();
    console.log('Generated registration code:', registration_code);

    // Insert participant with additional fields
    const result = await pool.query(
      `INSERT INTO participants (registration_code, full_name, organisation, position, phone, expected_arrival, host_name, host_department, visit_purpose, registration_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PRE_REGISTERED')
       RETURNING id, registration_code, full_name`,
      [registration_code, full_name, organisation, position, phone || null, expected_arrival || null, host_name || null, host_department || null, visit_purpose || null]
    );

    console.log('Insert successful:', result.rows[0]);

    // Clear cache to reflect updated data
    clearCache('registrations');

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      registration_code: result.rows[0].registration_code,
      full_name: result.rows[0].full_name
    });
  } catch (error) {
    console.error('Error pre-registering participant:', error);
    return NextResponse.json(
      { error: 'Failed to pre-register participant' },
      { status: 500 }
    );
  }
}
