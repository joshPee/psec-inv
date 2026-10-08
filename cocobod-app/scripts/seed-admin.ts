import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  try {
    console.log('Seeding admin user...');

    const email = 'admin@pcc.gov.gh';
    const password = 'admin123'; // Change this in production
    const name = 'Administrator';

    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      await pool.end();
      return;
    }

    await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3)`,
      [email, passwordHash, name]
    );

    console.log('Admin user created successfully');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Please change the password after first login');

    await pool.end();
  } catch (error) {
    console.error('Error seeding admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

seedAdmin();
