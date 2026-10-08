import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyReturn, notifyDamagedRecord, notifyMissingRecord } from '@/lib/notifications';

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
    const { issueItemId, quantityReturned, condition, remarks } = body;

    if (!issueItemId || !quantityReturned || !condition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the issue item with related issue record and guard details
    const issueItem = await prisma.equipmentIssueItem.findUnique({
      where: { id: issueItemId },
      include: {
        issue: {
          include: {
            guard: true,
          },
        },
      },
    });

    if (!issueItem) {
      return NextResponse.json({ error: 'Issue item not found' }, { status: 404 });
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id: issueItem.equipmentId },
    });

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    if (issueItem.quantityReturned + quantityReturned > issueItem.quantityIssued) {
      return NextResponse.json(
        { error: 'Cannot return more than issued quantity' },
        { status: 400 }
      );
    }

    if (issueItem.quantityOutstanding < quantityReturned) {
      return NextResponse.json(
        { error: 'Cannot return more than outstanding quantity' },
        { status: 400 }
      );
    }

    // Update the issue item
    const updatedIssueItem = await prisma.equipmentIssueItem.update({
      where: { id: issueItemId },
      data: {
        quantityReturned: { increment: quantityReturned },
        quantityOutstanding: { decrement: quantityReturned },
        conditionAtReturn: condition,
        returnedAt: new Date(),
        remarks,
      },
    });

    // Update equipment quantities following: Total = Available + Reserved + Issued + Damaged + Missing
    const isGoodCondition = condition === 'GOOD';
    const isDamaged = condition === 'DAMAGED' || condition === 'SLIGHTLY_DAMAGED';
    const isMissing = condition === 'MISSING';

    await prisma.equipment.update({
      where: { id: issueItem.equipmentId },
      data: {
        issuedQuantity: { decrement: quantityReturned },
        availableQuantity: isGoodCondition 
          ? { increment: quantityReturned } 
          : undefined,
        damagedQuantity: isDamaged 
          ? { increment: quantityReturned } 
          : undefined,
        missingQuantity: isMissing 
          ? { increment: quantityReturned } 
          : undefined,
      },
    });

    // Auto-create Damaged or Missing record if returned defective/lost
    if (isDamaged) {
      await prisma.damagedEquipmentRecord.create({
        data: {
          equipmentId: issueItem.equipmentId,
          guardId: issueItem.issue.guardId,
          quantity: quantityReturned,
          condition,
          damageDescription: remarks || `Returned in ${condition} condition during equipment return`,
          remarks,
          recordedById: session.user.id,
          status: 'ACTIVE',
        },
      });
    } else if (isMissing) {
      await prisma.missingEquipmentRecord.create({
        data: {
          equipmentId: issueItem.equipmentId,
          guardId: issueItem.issue.guardId,
          quantity: quantityReturned,
          investigationStatus: 'UNDER_INVESTIGATION',
          remarks: remarks || `Reported missing during equipment return check`,
          recordedById: session.user.id,
          status: 'ACTIVE',
        },
      });
    }

    // Create movement record with guard accountability
    await prisma.equipmentMovement.create({
      data: {
        equipmentId: issueItem.equipmentId,
        guardId: issueItem.issue.guardId,
        movedById: session.user.id,
        action: 'RETURNED',
        quantity: quantityReturned,
        condition,
        remarks,
      },
    });

    // Check if all items in the issue are returned
    const allIssueItems = await prisma.equipmentIssueItem.findMany({
      where: { issueId: issueItem.issueId },
    });

    const totalReturned = allIssueItems.reduce((sum, item) => sum + item.quantityReturned, 0);
    const totalIssued = allIssueItems.reduce((sum, item) => sum + item.quantityIssued, 0);

    if (totalReturned === totalIssued) {
      await prisma.equipmentIssue.update({
        where: { id: issueItem.issueId },
        data: { status: 'FULLY_RETURNED' },
      });
    }

    // Real-time inter-portal communication: Notify supervisors and custodians
    const guardName = issueItem.issue.guard?.fullName || 'Guard';
    notifyReturn(guardName, equipment.itemName, quantityReturned).catch(console.error);

    if (isDamaged) {
      notifyDamagedRecord(equipment.itemName, guardName, quantityReturned).catch(console.error);
    } else if (isMissing) {
      notifyMissingRecord(equipment.itemName, guardName, quantityReturned).catch(console.error);
    }

    return NextResponse.json({ success: true, issueItem: updatedIssueItem });
  } catch (error) {
    console.error('Error returning equipment:', error);
    return NextResponse.json(
      { error: 'Failed to return equipment' },
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

    const issueItems = await prisma.equipmentIssueItem.findMany({
      where: {
        quantityOutstanding: { gt: 0 },
      },
      take: 100,
    });

    // Fetch related data for each item
    const enrichedItems = await Promise.all(
      issueItems.map(async (item) => {
        const issueRecord = await prisma.equipmentIssue.findUnique({
          where: { id: item.issueId },
        });
        const equipment = await prisma.equipment.findUnique({
          where: { id: item.equipmentId },
          include: { category: true },
        });
        return {
          ...item,
          issueRecord,
          equipment,
        };
      })
    );

    return NextResponse.json(enrichedItems);
  } catch (error) {
    console.error('Error fetching equipment returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment returns' },
      { status: 500 }
    );
  }
}
