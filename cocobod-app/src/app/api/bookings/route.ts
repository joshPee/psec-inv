import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notifyBookingRequest } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const guardId = searchParams.get('guardId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (guardId) where.guardId = guardId;

    const bookings = await prisma.equipmentBooking.findMany({
      where,
      include: {
        guard: true,
        equipment: { include: { category: true } },
        decidedBy: { select: { id: true, fullName: true, staffId: true } },
        fulfilledIssue: { select: { id: true, issuedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let guardId: string | null = null;
    let isGuard = false;

    const body = await request.json();
    const { guardId: bodyGuardId, equipmentId, quantityRequested, requestedFor, dutyPoint, shift, remarks } = body;

    // Check for custodian session (NextAuth)
    if (session && session.user?.role === 'EQUIPMENT_CUSTODIAN') {
      // Custodian creating booking on behalf of guard
      guardId = bodyGuardId;
    } else {
      // Check for guard session (cookie-based)
      const guardSessionCookie = request.cookies.get('guard-session');
      if (!guardSessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      try {
        const guardSession = JSON.parse(guardSessionCookie.value);
        guardId = guardSession.guardId;
        isGuard = true;
      } catch {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
    }

    if (!guardId) {
      return NextResponse.json({ error: 'Guard ID required' }, { status: 400 });
    }

    // Validation
    const missing: string[] = [];
    if (!guardId) missing.push('guard');
    if (!equipmentId) missing.push('equipment');
    if (!quantityRequested || quantityRequested < 1) missing.push('quantity');
    if (!requestedFor) missing.push('requested date');
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch equipment and guard
    const [equipment, guard] = await Promise.all([
      prisma.equipment.findUnique({ where: { id: equipmentId } }),
      prisma.guard.findUnique({ where: { id: guardId } }),
    ]);

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    if (!guard) {
      return NextResponse.json({ error: 'Guard not found' }, { status: 404 });
    }

    if (equipment.availableQuantity < quantityRequested) {
      return NextResponse.json(
        { error: `Insufficient available quantity. Only ${equipment.availableQuantity} available.` },
        { status: 400 }
      );
    }

    // Atomically reserve stock and create booking
    const transactionOperations: any[] = [
      prisma.equipmentBooking.create({
        data: {
          guardId,
          equipmentId,
          quantityRequested,
          requestedFor: new Date(requestedFor),
          dutyPoint: dutyPoint || null,
          shift: shift || null,
          remarks: remarks || null,
          status: 'PENDING',
          // Auto-expire 24 hours after requested date
          expiresAt: new Date(new Date(requestedFor).getTime() + 24 * 60 * 60 * 1000),
        },
      }),
      // Reserve the stock: available → reserved
      prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          availableQuantity: { decrement: quantityRequested },
          reservedQuantity: { increment: quantityRequested },
        },
      }),
    ];

    // Log the booking movement (only if created by a custodian/user)
    if (session?.user?.id) {
      transactionOperations.push(
        prisma.equipmentMovement.create({
          data: {
            equipmentId,
            guardId,
            movedById: session.user.id,
            action: 'BOOKED',
            quantity: quantityRequested,
            dutyPoint: dutyPoint || null,
            remarks: `Advance booking for ${new Date(requestedFor).toLocaleDateString()}`,
          },
        })
      );
    }

    const [booking] = await prisma.$transaction(transactionOperations);

    // Notify supervisors about new booking
    notifyBookingRequest(guard.fullName, equipment.itemName, quantityRequested).catch(console.error);

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
