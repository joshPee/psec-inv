import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateAddSortOrder() {
  try {
    console.log('Adding sort_order column to participants table...');
    
    // Check if column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'participants' 
      AND column_name = 'sort_order'
    `);
    
    if (checkResult.rows.length === 0) {
      await pool.query('ALTER TABLE participants ADD COLUMN sort_order INTEGER DEFAULT 0');
      console.log('Successfully added sort_order column');
    } else {
      console.log('sort_order column already exists');
    }
    
    // Reset participants with hierarchical order
    console.log('Resetting participants with hierarchical order...');
    const resetPath = path.join(__dirname, '../src/lib/reset_participants.sql');
    const resetScript = fs.readFileSync(resetPath, 'utf-8');
    
    await pool.query(resetScript);
    
    console.log('Participants reset completed with hierarchical order!');
    console.log('Migration completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error during migration:', error);
    await pool.end();
    process.exit(1);
  }
}

migrateAddSortOrder();
