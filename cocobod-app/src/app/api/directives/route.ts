import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyDirective, notifyHandover } from '@/lib/notifications'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch operational communications
    const [allDirectives, allHandovers] = await Promise.all([
      // Directives sent to or visible to this user/role
      prisma.notification.findMany({
        where: {
          type: 'DIRECTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
              staffId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),

      // Shift handovers
      prisma.notification.findMany({
        where: {
          type: 'HANDOVER',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
              staffId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ])

    // Deduplicate directives by title and timestamp (within 5 seconds) to present unique directives
    const uniqueDirectivesMap = new Map<string, any>()
    for (const d of allDirectives) {
      const key = `${d.title}__${Math.floor(new Date(d.createdAt).getTime() / 5000)}`
      if (!uniqueDirectivesMap.has(key)) {
        uniqueDirectivesMap.set(key, {
          id: d.id,
          title: d.title,
          message: d.message,
          createdAt: d.createdAt,
          read: d.read,
          recipientId: d.userId,
        })
      }
    }

    // Deduplicate handovers
    const uniqueHandoversMap = new Map<string, any>()
    for (const h of allHandovers) {
      const key = `${h.title}__${Math.floor(new Date(h.createdAt).getTime() / 5000)}`
      if (!uniqueHandoversMap.has(key)) {
        uniqueHandoversMap.set(key, {
          id: h.id,
          title: h.title,
          message: h.message,
          createdAt: h.createdAt,
          read: h.read,
          recipientId: h.userId,
        })
      }
    }

    return NextResponse.json({
      directives: Array.from(uniqueDirectivesMap.values()),
      handovers: Array.from(uniqueHandoversMap.values()),
    })
  } catch (error) {
    console.error('Error fetching directives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch directives' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, title, content, priority = 'NORMAL', shift = 'DAY', summary } = body

    if (action === 'POST_DIRECTIVE') {
      if (session.user.role !== 'SECURITY_SUPERVISOR') {
        return NextResponse.json(
          { error: 'Only Security Supervisors can issue armory directives' },
          { status: 403 }
        )
      }

      if (!title || !content) {
        return NextResponse.json(
          { error: 'Title and content are required for a directive' },
          { status: 400 }
        )
      }

      await notifyDirective(session.user.fullName, title, priority, content)

      // Also record in the supervisor's own notification stream for their record
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'DIRECTIVE',
          title: `[${priority}] Outgoing Directive: ${title}`,
          message: content,
          read: true,
        },
      })

      return NextResponse.json({ success: true, message: 'Directive published to all custodians' })
    }

    if (action === 'SUBMIT_HANDOVER') {
      if (!summary) {
        return NextResponse.json(
          { error: 'Handover summary is required' },
          { status: 400 }
        )
      }

      await notifyHandover(session.user.fullName, shift, summary)

      // Also record for the custodian
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'HANDOVER',
          title: `Outgoing Handover (${shift} Shift)`,
          message: summary,
          read: true,
        },
      })

      return NextResponse.json({ success: true, message: 'Shift handover submitted to supervisors' })
    }

    if (action === 'ACKNOWLEDGE_DIRECTIVE') {
      const { notificationId, directiveTitle } = body
      if (notificationId) {
        await prisma.notification.updateMany({
          where: { id: notificationId, userId: session.user.id },
          data: { read: true },
        })
      }

      // Notify supervisors that this custodian acknowledged
      const supervisors = await prisma.user.findMany({
        where: { role: 'SECURITY_SUPERVISOR', isActive: true },
      })

      for (const sup of supervisors) {
        await prisma.notification.create({
          data: {
            userId: sup.id,
            type: 'SYSTEM',
            title: 'Directive Acknowledged',
            message: `Custodian ${session.user.fullName} acknowledged directive "${directiveTitle || 'Armory Directive'}"`,
          },
        })
      }

      return NextResponse.json({ success: true, message: 'Directive acknowledged' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing directive action:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
