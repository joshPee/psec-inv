import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('photo') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Update guard with photo URL
    const guard = await prisma.guard.update({
      where: { id },
      data: { photoUrl: dataUrl },
    }) as any

    return NextResponse.json({ success: true, photoUrl: guard.photoUrl })
  } catch (error) {
    console.error('Error uploading guard photo:', error)
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.guard.update({
      where: { id },
      data: { photoUrl: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guard photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
