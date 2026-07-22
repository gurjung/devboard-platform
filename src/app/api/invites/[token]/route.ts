import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { INVITE_REASONS } from "@/features/workspace/constants";

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const { token } = await params;

  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.NOT_FOUND },
        { status: 404 }
      );
    }

    if (invite.status === "ACCEPTED") {
      return NextResponse.json(
        {
          success: false,
          reason: INVITE_REASONS.ALREADY_ACCEPTED,
          data: {
            workspaceSlug: invite.workspace.slug,
            workspaceName: invite.workspace.name,
          },
        },
        { status: 200 }
      );
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.REVOKED },
        { status: 410 }
      );
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.EXPIRED },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        workspaceName: invite.workspace.name,
        email: invite.email,
        role: invite.role,
      },
    });
  } catch (error) {
    console.error("Failed to fetch invite details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { token } = await params;

  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.NOT_FOUND },
        { status: 404 }
      );
    }

    if (invite.status === "ACCEPTED") {
      return NextResponse.json({
        success: true,
        data: {
          workspaceSlug: invite.workspace.slug,
        },
      });
    }

    if (invite.status === "REVOKED") {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.REVOKED },
        { status: 410 }
      );
    }

    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json(
        { success: false, reason: INVITE_REASONS.EXPIRED },
        { status: 410 }
      );
    }

    if (invite.email !== session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: `This invite was sent to ${invite.email}`,
        },
        { status: 403 }
      );
    }

    const workspaceSlug = await prisma.$transaction(async (tx) => {
      const existingMember = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId: userId,
          },
        },
      });

      if (!existingMember) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: userId,
            role: invite.role,
          },
        });
      }

      await tx.workspaceInvite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
        },
      });

      return invite.workspace.slug;
    });

    return NextResponse.json({
      success: true,
      data: { workspaceSlug },
    });
  } catch (error) {
    console.error("Failed to accept invite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
