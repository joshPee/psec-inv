import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SECURITY_SUPERVISOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, isActive, parentId, lowStockThreshold } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.equipmentCategory.update({
      where: { id },
      data: {
        name,
        description,
        isActive: isActive !== undefined ? isActive : true,
        parentId: parentId || null,
        lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : 5
      },
      include: {
        parent: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SECURITY_SUPERVISOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if category has equipment
    const equipmentCount = await prisma.equipment.count({
      where: { categoryId: id }
    })

    if (equipmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing equipment' },
        { status: 400 }
      )
    }

    // Check if category has children
    const childrenCount = await prisma.equipmentCategory.count({
      where: { parentId: id }
    })

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories' },
        { status: 400 }
      )
    }

    await prisma.equipmentCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
