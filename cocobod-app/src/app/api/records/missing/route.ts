import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyMissingRecord } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { equipmentId, guardId, quantity, remarks } = body;

    if (!equipmentId || !quantity) {
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

    // Create missing equipment record
    const missingRecord = await prisma.missingEquipmentRecord.create({
      data: {
        equipmentId,
        guardId: guardId || undefined,
        quantity,
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
        missingQuantity: { increment: quantity },
        availableQuantity: { decrement: quantity },
      },
    });

    // Create movement record
    await prisma.equipmentMovement.create({
      data: {
        equipmentId,
        guardId: guardId || undefined,
        movedById: session.user.id,
        action: 'MISSING',
        quantity,
        condition: 'MISSING',
        remarks,
      },
    });

    return NextResponse.json({ success: true, missingRecord });
  } catch (error) {
    console.error('Error recording missing equipment:', error);
    return NextResponse.json(
      { error: 'Failed to record missing equipment' },
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

    const missingRecords = await prisma.missingEquipmentRecord.findMany({
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

    return NextResponse.json(missingRecords);
  } catch (error) {
    console.error('Error fetching missing records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch missing records' },
      { status: 500 }
    );
  }
}
