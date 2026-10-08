import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyBookingExpired, notifyLowStock } from '@/lib/notifications';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();
    const { action, remarks } = body; // action: 'approve' | 'reject' | 'cancel' | 'fulfill'

    const booking = await prisma.equipmentBooking.findUnique({
      where: { id: bookingId },
      include: { guard: true, equipment: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ── APPROVE ──────────────────────────────────────
    if (action === 'approve') {
      if (booking.status !== 'PENDING') {
        return NextResponse.json(
          { error: `Cannot approve a booking with status ${booking.status}` },
          { status: 400 }
        );
      }

      const updated = await prisma.equipmentBooking.update({
        where: { id: bookingId },
        data: {
          status: 'APPROVED',
          decidedById: session.user.id,
          decidedAt: new Date(),
          remarks: remarks || booking.remarks,
        },
        include: { guard: true, equipment: true },
      });

      return NextResponse.json({ success: true, booking: updated });
    }

    // ── REJECT ───────────────────────────────────────
    if (action === 'reject') {
      if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
        return NextResponse.json(
          { error: `Cannot reject a booking with status ${booking.status}` },
          { status: 400 }
        );
      }

      // Release reserved stock back to available
      await prisma.$transaction([
        prisma.equipmentBooking.update({
          where: { id: bookingId },
          data: {
            status: 'REJECTED',
            decidedById: session.user.id,
            decidedAt: new Date(),
            remarks: remarks || booking.remarks,
          },
        }),
        prisma.equipment.update({
          where: { id: booking.equipmentId },
          data: {
            availableQuantity: { increment: booking.quantityRequested },
            reservedQuantity: { decrement: booking.quantityRequested },
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Booking rejected, stock released.' });
    }

    // ── CANCEL ───────────────────────────────────────
    if (action === 'cancel') {
      if (booking.status === 'FULFILLED' || booking.status === 'EXPIRED') {
        return NextResponse.json(
          { error: `Cannot cancel a ${booking.status.toLowerCase()} booking` },
          { status: 400 }
        );
      }

      // Release reserved stock
      await prisma.$transaction([
        prisma.equipmentBooking.update({
          where: { id: bookingId },
          data: {
            status: 'CANCELLED',
            decidedById: session.user.id,
            decidedAt: new Date(),
            remarks: remarks || booking.remarks,
          },
        }),
        prisma.equipment.update({
          where: { id: booking.equipmentId },
          data: {
            availableQuantity: { increment: booking.quantityRequested },
            reservedQuantity: { decrement: booking.quantityRequested },
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Booking cancelled, stock released.' });
    }

    // ── FULFILL ──────────────────────────────────────
    if (action === 'fulfill') {
      if (session.user?.role !== 'EQUIPMENT_CUSTODIAN') {
        return NextResponse.json(
          { error: 'Only Equipment Custodians can fulfill bookings' },
          { status: 403 }
        );
      }

      if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
        return NextResponse.json(
          { error: `Cannot fulfill a booking with status ${booking.status}` },
          { status: 400 }
        );
      }

      // Atomically: reserved → issued, create EquipmentIssue, link to booking
      const [updatedBooking] = await prisma.$transaction([
        prisma.equipmentBooking.update({
          where: { id: bookingId },
          data: {
            status: 'FULFILLED',
            decidedById: session.user.id,
            decidedAt: new Date(),
            remarks: remarks || booking.remarks,
          },
          include: { guard: true, equipment: true },
        }),
        // Move stock from reserved → issued
        prisma.equipment.update({
          where: { id: booking.equipmentId },
          data: {
            reservedQuantity: { decrement: booking.quantityRequested },
            issuedQuantity: { increment: booking.quantityRequested },
          },
        }),
        // Create the actual issue record
        prisma.equipmentIssue.create({
          data: {
            guardId: booking.guardId,
            custodianId: session.user.id,
            shift: booking.shift || undefined,
            dutyPoint: booking.dutyPoint || undefined,
            status: 'ISSUED',
            remarks: `Fulfilled from booking ${bookingId}`,
            items: {
              create: {
                equipmentId: booking.equipmentId,
                quantityIssued: booking.quantityRequested,
                quantityOutstanding: booking.quantityRequested,
                conditionAtIssue: booking.equipment.defaultCondition,
              },
            },
          },
        }),
        // Create movement record for the issuance
        prisma.equipmentMovement.create({
          data: {
            equipmentId: booking.equipmentId,
            guardId: booking.guardId,
            movedById: session.user.id,
            action: 'ISSUED',
            quantity: booking.quantityRequested,
            condition: booking.equipment.defaultCondition,
            dutyPoint: booking.dutyPoint || undefined,
            remarks: `Booking fulfillment`,
          },
        }),
      ]);

      // Check low stock after fulfillment
      const refreshedEquipment = await prisma.equipment.findUnique({
        where: { id: booking.equipmentId },
      });
      if (refreshedEquipment && refreshedEquipment.availableQuantity <= refreshedEquipment.lowStockThreshold) {
        notifyLowStock(refreshedEquipment.itemName, refreshedEquipment.availableQuantity).catch(console.error);
      }

      return NextResponse.json({ success: true, booking: updatedBooking });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing booking action:', error);
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
}

// GET single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const booking = await prisma.equipmentBooking.findUnique({
      where: { id },
      include: {
        guard: true,
        equipment: { include: { category: true } },
        decidedBy: { select: { id: true, fullName: true, staffId: true } },
        fulfilledIssue: {
          include: {
            items: { include: { equipment: true } },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
