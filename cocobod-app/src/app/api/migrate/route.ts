import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const results: any[] = [];

    // Create watchlist table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS watchlist (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          reason TEXT NOT NULL,
          description TEXT,
          added_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
          date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      results.push({ table: 'watchlist', status: 'created' });

      // Create indexes for watchlist
      await sql`CREATE INDEX IF NOT EXISTS idx_watchlist_full_name ON watchlist(full_name)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_watchlist_is_active ON watchlist(is_active)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_watchlist_date_added ON watchlist(date_added)`;
      results.push({ table: 'watchlist', status: 'indexed' });
    } catch (error) {
      results.push({ table: 'watchlist', status: 'error', error: String(error) });
    }

    // Create staff table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS staff (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          department VARCHAR(255),
          position VARCHAR(255),
          email VARCHAR(255),
          phone VARCHAR(50),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      results.push({ table: 'staff', status: 'created' });

      // Create indexes for staff
      await sql`CREATE INDEX IF NOT EXISTS idx_staff_full_name ON staff(full_name)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active)`;
      results.push({ table: 'staff', status: 'indexed' });
    } catch (error) {
      results.push({ table: 'staff', status: 'error', error: String(error) });
    }

    // Check if visitor_types table exists (it should from visitor-schema.sql)
    try {
      const check = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'visitor_types'
        )
      `;
      if (check[0]?.exists) {
        results.push({ table: 'visitor_types', status: 'already_exists' });
      } else {
        results.push({ table: 'visitor_types', status: 'not_found', message: 'Run visitor-schema.sql first' });
      }
    } catch (error) {
      results.push({ table: 'visitor_types', status: 'error', error: String(error) });
    }

    // Check if visitor_logs table exists (it should from visitor-schema.sql)
    try {
      const check = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'visitor_logs'
        )
      `;
      if (check[0]?.exists) {
        results.push({ table: 'visitor_logs', status: 'already_exists' });
      } else {
        results.push({ table: 'visitor_logs', status: 'not_found', message: 'Run visitor-schema.sql first' });
      }
    } catch (error) {
      results.push({ table: 'visitor_logs', status: 'error', error: String(error) });
    }

    // Add expected_arrival column to participants if it doesn't exist
    try {
      await sql`
        ALTER TABLE participants 
        ADD COLUMN IF NOT EXISTS expected_arrival TIMESTAMP
      `;
      results.push({ table: 'participants', status: 'column_added', column: 'expected_arrival' });
    } catch (error) {
      results.push({ table: 'participants', status: 'error', error: String(error) });
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  }
}