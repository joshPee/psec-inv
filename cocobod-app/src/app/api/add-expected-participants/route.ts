import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const expectedParticipants = [
  { full_name: 'Mr. Frank Asante', position: 'Managing Director' },
  { full_name: 'Mr. William Azalekor', position: 'Deputy Managing Director' },
  { full_name: 'Mr. Martin Asiamah', position: 'Deputy Director, Finance' },
  { full_name: 'Mr. Oheneba Boamah', position: 'Deputy Director, Human Resource' },
  { full_name: 'Mr. Frank Owusu Amoako', position: 'Security Manager' },
  { full_name: 'Mr. Kwaku Ohemeng', position: 'IT Manager' },
  { full_name: 'Mr. Frank Amoafua Mensah', position: 'Deputy HR Manager' },
  { full_name: 'Raphael Avemegah', position: 'Ag Principal' },
  { full_name: 'Mr. Dacosta Awuku', position: 'Principal' },
  { full_name: 'Justina Gifty Frempong', position: 'HR Manager' },
  { full_name: 'Mr. Daniel Wiah Salifu', position: 'Deputy QC Manager' },
  { full_name: 'Mr. Douglas Effah', position: 'Principal QC Officer' },
  { full_name: 'Mr. Onasis', position: 'Principal Security Officer' },
  { full_name: 'Dominic Gyimah', position: 'Accounts Manager' },
  { full_name: 'Agyabeng Maxwell', position: 'Audit Manager' },
  // TMA Team
  { full_name: 'Hon. Ebi Bright', position: 'MCE', organisation: 'TMA' },
  { full_name: 'Francis Mensah', position: 'MCD', organisation: 'TMA' },
  { full_name: 'Jeremiah Amoafo', position: 'Metro Development Planner', organisation: 'TMA' },
  { full_name: 'Eden Gbekorvor', position: 'Metro Physical Planner', organisation: 'TMA' },
  { full_name: 'Frank Asante', position: 'PRO', organisation: 'TMA' },
  { full_name: 'Augustine Pepraf', position: 'Incoming MCD', organisation: 'TMA' },
];

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const addedParticipants = [];
    
    for (const participant of expectedParticipants) {
      // Generate code based on organisation
      const organisation = participant.organisation || 'QCC';
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
      const registration_code = `${organisation}-${randomDigits}`;
      
      const query = `
        INSERT INTO participants (
          registration_code,
          full_name,
          organisation,
          position,
          participant_status,
          registration_date,
          registration_status
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
        ON CONFLICT (registration_code) DO NOTHING
        RETURNING id, full_name, position
      `;
      
      const values = [
        registration_code,
        participant.full_name,
        organisation,
        participant.position,
        'EXPECTED',
        'PENDING'
      ];
      
      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        addedParticipants.push(result.rows[0]);
      }
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${addedParticipants.length} expected participants`,
      participants: addedParticipants
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding participants:', error);
    return NextResponse.json(
      { error: 'Failed to add participants', details: error },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
