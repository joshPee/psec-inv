import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyIssue, notifyLowStock } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'EQUIPMENT_CUSTODIAN') {
      return NextResponse.json(
        { error: 'Forbidden: Only Equipment Custodians are authorized to perform equipment transactions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { equipmentId, guardId, quantity, condition, shift = 'DAY', dutyPoint, remarks } = body;

    if (!equipmentId || !guardId || !quantity || !condition || !shift) {
      const missing = [];
      if (!equipmentId) missing.push('equipment');
      if (!guardId) missing.push('security guard');
      if (!quantity) missing.push('quantity');
      if (!condition) missing.push('condition');
      if (!shift) missing.push('shift');
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Get equipment details
    const [equipment, guard] = await Promise.all([
      prisma.equipment.findUnique({
        where: { id: equipmentId },
      }),
      prisma.guard.findUnique({
        where: { id: guardId },
      }),
    ]);

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    if (!guard) {
      return NextResponse.json({ error: 'Security guard not found' }, { status: 404 });
    }

    if (equipment.availableQuantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient available quantity' },
        { status: 400 }
      );
    }

    // Create equipment issue record
    const issue = await prisma.equipmentIssue.create({
      data: {
        guardId,
        custodianId: session.user.id,
        shift,
        dutyPoint,
        remarks,
        status: 'ISSUED',
      },
    });

    // Create equipment issue items
    const issueItems = await prisma.equipmentIssueItem.create({
      data: {
        issueId: issue.id,
        equipmentId,
        quantityIssued: quantity,
        quantityOutstanding: quantity,
        conditionAtIssue: condition,
      },
    });

    // Update equipment quantities
    const newAvailable = equipment.availableQuantity - quantity;
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        availableQuantity: { decrement: quantity },
        issuedQuantity: { increment: quantity },
      },
    });

    // Create movement record with guard accountability
    await prisma.equipmentMovement.create({
      data: {
        equipmentId,
        guardId,
        movedById: session.user.id,
        action: 'ISSUED',
        quantity,
        condition,
        dutyPoint,
        remarks,
      },
    });

    // Real-time inter-portal communication: Notify supervisors of issuance
    notifyIssue(guard.fullName, equipment.itemName, quantity).catch(console.error);

    // Check low stock threshold and alert supervisors & custodians
    if (newAvailable <= equipment.lowStockThreshold) {
      notifyLowStock(equipment.itemName, newAvailable).catch(console.error);
    }

    return NextResponse.json({ success: true, issue, issueItem: issueItems });
  } catch (error) {
    console.error('Error issuing equipment:', error);
    return NextResponse.json(
      { error: 'Failed to issue equipment' },
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

    const issues = await prisma.equipmentIssue.findMany({
      include: {
        custodian: true,
        guard: true,
        items: {
          include: {
            equipment: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error('Error fetching equipment issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment issues' },
      { status: 500 }
    );
  }
}
