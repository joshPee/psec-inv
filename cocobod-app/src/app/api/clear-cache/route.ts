import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Clear all caches
    clearCache('attendance');
    clearCache('registrations');
    clearCache('events');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
