import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(req);
    const { id } = params;
    const { action, reason } = await req.json(); // action: "APPROVE", "REJECT", "REQUEST_CHANGES"

    const property = await prisma.property.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
    }

    let newStatus = property.status;
    let auditAction = '';

    if (action === 'APPROVE') {
      newStatus = 'LISTED';
      auditAction = 'Approved PG';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      auditAction = 'Rejected PG';
    } else if (action === 'REQUEST_CHANGES') {
      newStatus = 'PENDING_VERIFICATION';
      auditAction = 'Requested changes for PG';
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedAt: action === 'APPROVE' ? new Date() : null,
      },
    });

    // Notify the owner
    await prisma.notification.create({
      data: {
        userId: property.ownerId,
        title: `Property ${auditAction}`,
        message:
          action === 'APPROVE'
            ? `Congratulations! ${property.name} has been verified and is now live on Stayzy.`
            : `Your property ${property.name} requires attention: ${reason || 'Please review uploaded documents.'}`,
        type: 'VERIFICATION',
        link: `/owner/properties/${property.id}`,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session?.userId || 'admin',
        actorName: session?.name || 'Admin',
        actorRole: session?.role || 'ADMIN',
        action: auditAction,
        entityType: 'Property',
        entityId: id,
        details: `${property.name} (Owner: ${property.owner.name})${reason ? ` - Reason: ${reason}` : ''}`,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

