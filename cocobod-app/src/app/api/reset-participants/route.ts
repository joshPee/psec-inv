import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import { join } from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    // Read the reset SQL file
    const sqlPath = join(process.cwd(), 'src', 'lib', 'reset_participants.sql');
    const sqlContent = await readFile(sqlPath, 'utf-8');

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute the reset script
      await client.query(sqlContent);
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: 'All visitor data cleared successfully. System is ready for fresh start.' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error resetting participants:', error);
    return NextResponse.json(
      { error: 'Failed to reset participants', details: String(error) },
      { status: 500 }
    );
  }
}
