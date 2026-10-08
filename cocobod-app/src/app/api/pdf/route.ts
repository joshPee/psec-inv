import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Check if download parameter is present
    const { searchParams } = new URL(request.url);
    const download = searchParams.get('download') === 'true';
    
    // Path to your JPG file - you can change this to your actual image
    const imagePath = join(process.cwd(), 'public', 'qcc-info.jpg');
    
    // Read the JPG file
    const imageBuffer = await readFile(imagePath);
    
    // Return the JPG with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': download ? 'attachment; filename="qcc-info.jpg"' : 'inline; filename="qcc-info.jpg"',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Image file not found' },
      { status: 404 }
    );
  }
}
