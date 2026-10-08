import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyRecordResolved } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, restoreStock } = body;

    if (!status || !['RESOLVED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be RESOLVED or ARCHIVED.' },
        { status: 400 }
      );
    }

    // Get the existing record
    const record = await prisma.damagedEquipmentRecord.findUnique({
      where: { id },
      include: { equipment: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Damaged record not found' },
        { status: 404 }
      );
    }

    if (record.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Only active records can be resolved or archived' },
        { status: 400 }
      );
    }

    // Update the record status
    const updatedRecord = await prisma.damagedEquipmentRecord.update({
      where: { id },
      data: { status },
    });

    // If resolving and restoring stock (item was repaired), update equipment quantities
    if (status === 'RESOLVED' && restoreStock) {
      await prisma.equipment.update({
        where: { id: record.equipmentId },
        data: {
          damagedQuantity: { decrement: record.quantity },
          availableQuantity: { increment: record.quantity },
        },
      });

      // Create movement record for the restoration
      await prisma.equipmentMovement.create({
        data: {
          equipmentId: record.equipmentId,
          guardId: record.guardId,
          movedById: session.user.id,
          action: 'RETURNED',
          quantity: record.quantity,
          condition: 'GOOD',
          remarks: `Damaged item resolved and restored to stock`,
        },
      });
    }

    // Notify staff of resolution
    notifyRecordResolved(
      'Damaged',
      record.equipment.itemName,
      session.user.fullName || 'Supervisor',
      status,
      Boolean(restoreStock)
    ).catch(console.error);

    return NextResponse.json({ success: true, record: updatedRecord });
  } catch (error) {
    console.error('Error updating damaged record:', error);
    return NextResponse.json(
      { error: 'Failed to update damaged record' },
      { status: 500 }
    );
  }
}
