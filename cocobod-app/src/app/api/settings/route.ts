import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const settings = await sql`
      SELECT key, value FROM settings
    `;
    
    const settingsObj: Record<string, any> = {};
    settings.forEach((setting: any) => {
      settingsObj[setting.key] = setting.value;
    });
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { siteName, registrationOpen, maxDailyVisitors, autoCheckOutHours } = body;

    // Update or insert each setting
    const settings = [
      { key: 'siteName', value: siteName },
      { key: 'registrationOpen', value: registrationOpen },
      { key: 'maxDailyVisitors', value: maxDailyVisitors },
      { key: 'autoCheckOutHours', value: autoCheckOutHours },
    ];

    for (const setting of settings) {
      await sql`
        INSERT INTO settings (key, value)
        VALUES (${setting.key}, ${setting.value})
        ON CONFLICT (key) DO UPDATE SET value = ${setting.value}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
