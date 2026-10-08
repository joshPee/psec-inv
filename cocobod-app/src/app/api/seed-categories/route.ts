import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const defaultCategories = [
  { name: 'Weapons', description: 'Firearms and ammunition' },
  { name: 'Communication', description: 'Radios and communication devices' },
  { name: 'Uniforms', description: 'Clothing and protective gear' },
  { name: 'Vehicles', description: 'Transportation vehicles' },
  { name: 'Medical', description: 'First aid and medical equipment' },
  { name: 'Surveillance', description: 'Cameras and monitoring equipment' },
  { name: 'Access Control', description: 'Keys, cards, and access devices' },
  { name: 'Protective Gear', description: 'Body armor and helmets' },
  { name: 'Lighting', description: 'Flashlights and illumination equipment' },
  { name: 'Tools', description: 'General purpose tools and equipment' },
]

export async function POST(request: NextRequest) {
  try {
    const { force = false } = await request.json()

    // Check if categories already exist
    const existingCount = await prisma.equipmentCategory.count()
    
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: true,
        message: `${existingCount} categories already exist. Use force=true to recreate.`,
        existing: true
      })
    }

    // Delete existing categories if force is true
    if (force && existingCount > 0) {
      await prisma.equipmentCategory.deleteMany({})
    }

    // Create default categories
    const createdCategories = await Promise.all(
      defaultCategories.map(category =>
        prisma.equipmentCategory.create({
          data: category
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Created ${createdCategories.length} categories`,
      categories: createdCategories
    })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET to create categories without force
export async function GET() {
  try {
    const existingCount = await prisma.equipmentCategory.count()
    
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `${existingCount} categories already exist`,
        existing: true
      })
    }

    const createdCategories = await Promise.all(
      defaultCategories.map(category =>
        prisma.equipmentCategory.create({
          data: category
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: `Created ${createdCategories.length} categories`,
      categories: createdCategories
    })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
