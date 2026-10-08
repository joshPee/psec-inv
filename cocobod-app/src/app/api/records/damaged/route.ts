import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyDamagedRecord } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { equipmentId, guardId, quantity, condition, remarks } = body;

    if (!equipmentId || !quantity || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get equipment details
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Create damaged equipment record
    const damagedRecord = await prisma.damagedEquipmentRecord.create({
      data: {
        equipmentId,
        guardId: guardId || undefined,
        quantity,
        condition,
        remarks,
        recordedById: session.user.id,
        recordedAt: new Date(),
        status: 'ACTIVE',
      },
    });

    // Update equipment quantities
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        damagedQuantity: { increment: quantity },
        availableQuantity: { decrement: quantity },
      },
    });

    // Create movement record
    await prisma.equipmentMovement.create({
      data: {
        equipmentId,
        guardId: guardId || undefined,
        movedById: session.user.id,
        action: 'DAMAGED',
        quantity,
        condition,
        remarks,
      },
    });

    return NextResponse.json({ success: true, damagedRecord });
  } catch (error) {
    console.error('Error recording damaged equipment:', error);
    return NextResponse.json(
      { error: 'Failed to record damaged equipment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const damagedRecords = await prisma.damagedEquipmentRecord.findMany({
      include: {
        equipment: {
          include: {
            category: true,
          },
        },
        guard: true,
        recordedBy: true,
      },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(damagedRecords);
  } catch (error) {
    console.error('Error fetching damaged records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch damaged records' },
      { status: 500 }
    );
  }
}
