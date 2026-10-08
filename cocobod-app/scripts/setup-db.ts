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

async function setupDatabase() {
  try {
    console.log('Setting up database schema...');
    
    const schemaPath = path.join(__dirname, '../src/lib/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    await pool.query(schema);
    
    console.log('Database schema setup completed!');
    
    // Add sort_order column if it doesn't exist
    console.log('Adding sort_order column if needed...');
    try {
      await pool.query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`);
      console.log('sort_order column added or already exists');
    } catch (error) {
      console.log('sort_order column may already exist, continuing...');
    }
    
    // Reset participants with hierarchical order
    console.log('Resetting participants with hierarchical order...');
    const resetPath = path.join(__dirname, '../src/lib/reset_participants.sql');
    const resetScript = fs.readFileSync(resetPath, 'utf-8');
    
    await pool.query(resetScript);
    
    console.log('Participants reset completed with hierarchical order!');
    await pool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
