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
];

async function addExpectedParticipants() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const participant of expectedParticipants) {
      const registration_code = `QCC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
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
        RETURNING id
      `;
      
      const values = [
        registration_code,
        participant.full_name,
        'QCC',
        participant.position,
        'EXPECTED',
        'PENDING'
      ];
      
      const result = await client.query(query, values);
      console.log(`Added: ${participant.full_name} - ${participant.position}`);
    }
    
    await client.query('COMMIT');
    console.log('All expected participants added successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding participants:', error);
    throw error;
  } finally {
    client.release();
  }
}

addExpectedParticipants()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
