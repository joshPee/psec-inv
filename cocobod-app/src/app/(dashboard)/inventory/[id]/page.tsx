import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EquipmentDetailClient from './EquipmentDetailClient'

async function getEquipmentDetail(equipmentId: string) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        category: true,
        movements: {
          include: {
            movedBy: { select: { id: true, fullName: true, staffId: true } },
            guard: { select: { id: true, fullName: true, badgeId: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!equipment) {
      return null
    }

    // Serialize dates
    return {
      ...equipment,
      movements: equipment.movements.map(movement => ({
        ...movement,
        createdAt: movement.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Error fetching equipment detail:', error)
    return null
  }
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const { id } = await params
  const equipment = await getEquipmentDetail(id)

  if (!equipment) {
    notFound()
  }

  return (
    <EquipmentDetailClient
      equipment={equipment}
      userRole={session.user.role}
    />
  )
}
