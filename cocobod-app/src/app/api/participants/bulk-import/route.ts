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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no data rows' },
        { status: 400 }
      );
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

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

    let importedCount = 0;
    let errors: string[] = [];

    for (const row of dataRows) {
      try {
        const values = row.split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Validate required fields
        if (!rowData.full_name || !rowData.organisation || !rowData.position) {
          errors.push(`Row ${importedCount + 1}: Missing required fields`);
          continue;
        }

        const trimmedName = rowData.full_name.trim();
        const trimmedOrg = rowData.organisation.trim();
        const trimmedPos = rowData.position.trim();

        // Basic validation
        if (trimmedName.length < 2 || trimmedOrg.length < 2 || trimmedPos.length < 2) {
          errors.push(`Row ${importedCount + 1}: Each field must be at least 2 characters`);
          continue;
        }

        if (/^\d+$/.test(trimmedName) || /^\d+$/.test(trimmedOrg) || /^\d+$/.test(trimmedPos)) {
          errors.push(`Row ${importedCount + 1}: Numbers only are not allowed`);
          continue;
        }

        // Generate unique registration code
        const registrationCode = await getUniqueCode();

        // Insert participant
        await pool.query(
          `INSERT INTO participants (
            registration_code, 
            full_name, 
            organisation, 
            position, 
            phone,
            expected_arrival,
            host_name,
            host_department,
            visit_purpose,
            event_id,
            registration_source
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PRE_REGISTERED')`,
          [
            registrationCode,
            trimmedName,
            trimmedOrg,
            trimmedPos,
            rowData.phone || null,
            rowData.expected_date && rowData.expected_time 
              ? `${rowData.expected_date}T${rowData.expected_time}`
              : null,
            rowData.host_name || null,
            rowData.host_department || null,
            rowData.visit_purpose || null,
            eventId
          ]
        );

        importedCount++;
      } catch (error) {
        console.error('Error importing row:', error);
        errors.push(`Row ${importedCount + 1}: Import failed`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors: errors.length > 0 ? errors : undefined,
      totalRows: dataRows.length
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Bulk import failed. Please try again.' },
      { status: 500 }
    );
  }
}
