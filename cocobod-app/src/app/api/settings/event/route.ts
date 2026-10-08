import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the active event
    const result = await pool.query("SELECT id, name, date, venue, description, status, registration_open FROM events WHERE status = 'ACTIVE' LIMIT 1");

    if (result.rows.length === 0) {
      // Return default settings if no event exists
      return NextResponse.json({
        name: 'COCOBOD Training School Meeting',
        date: '2026-08-19',
        venue: 'COCOBOD Training School',
        description: '',
        status: 'ACTIVE',
        registrationOpen: true,
      });
    }

    const event = result.rows[0];
    return NextResponse.json({
      name: event.name,
      date: event.date,
      venue: event.venue,
      description: event.description || '',
      status: event.status || 'ACTIVE',
      registrationOpen: event.registration_open,
    });
  } catch (error) {
    console.error('Error fetching event settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, date, venue, description, status, registrationOpen } = body;

    // Validate input
    if (!name || !date || !venue) {
      return NextResponse.json(
        { error: 'Name, date, and venue are required' },
        { status: 400 }
      );
    }

    // If saving as ACTIVE, archive all other events
    if (status === 'ACTIVE') {
      await pool.query("UPDATE events SET status = 'ARCHIVED' WHERE status = 'ACTIVE'");
    }

    // Check if event exists with the given name and date to determine if it's an update or new
    // For the Settings page, we'll assume it updates the currently active event OR creates a new active one
    // if there is no active event.
    
    // Check if there is ANY event (active or archived) we are trying to update
    // The settings page currently doesn't send an ID. We'll find the most recent event or active event.
    // Actually, to fully support Option B cleanly from settings, we'll assume the settings page ALWAYS updates the currently active event,
    // OR creates a new one if none exists.
    const existingActiveEvent = await pool.query("SELECT id FROM events WHERE status = 'ACTIVE' OR status = 'ARCHIVED' ORDER BY id DESC LIMIT 1");

    if (existingActiveEvent.rows.length === 0) {
      // Create new event
      await pool.query(
        `INSERT INTO events (name, date, venue, description, status, registration_open)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, date, venue, description || '', status || 'ACTIVE', registrationOpen]
      );
    } else {
      // Create a NEW event instead of overwriting, if they changed the name/date significantly?
      // Actually, for Option B, "Settings" usually updates the *current* event. "Meetings" creates *new* ones.
      // So Settings should just UPDATE the most recent/active event.
      await pool.query(
        `UPDATE events
         SET name = $1, date = $2, venue = $3, description = $4, status = $5, registration_open = $6
         WHERE id = $7`,
        [name, date, venue, description || '', status || 'ACTIVE', registrationOpen, existingActiveEvent.rows[0].id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving event settings:', error);
    return NextResponse.json(
      { error: 'Failed to save event settings' },
      { status: 500 }
    );
  }
}
