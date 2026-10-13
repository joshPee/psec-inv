import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  // Allow any authenticated user to run this
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('Trimming whitespace from item names...')

    const equipment = await prisma.equipment.findMany()

    let fixedCount = 0

    for (const item of equipment) {
      const trimmedName = item.itemName.trim()

      if (item.itemName !== trimmedName) {
        console.log(`Fixing: "${item.itemName}" -> "${trimmedName}"`)

        await prisma.equipment.update({
          where: { id: item.id },
          data: { itemName: trimmedName },
        })

        fixedCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} item name(s)`,
      fixedCount,
    })
  } catch (error) {
    console.error('Error fixing item names:', error)
    return NextResponse.json(
      { error: 'Failed to fix item names' },
      { status: 500 }
    )
  }
}
