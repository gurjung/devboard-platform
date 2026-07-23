import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inviteMemberSchema } from "@/features/workspace/schema";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { WorkspaceRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{
    workspaceId: string;
  }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    // 1. Verify that requester is an OWNER or ADMIN of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (
      !member ||
      (member.role !== WorkspaceRole.OWNER &&
        member.role !== WorkspaceRole.ADMIN)
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only workspace owners and admins can invite members",
        },
        { status: 403 }
      );
    }

    // 2. Validate request body
    const body = await req.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;

    // 3. Check if user is already a member of this workspace
    const invitee = await prisma.user.findUnique({
      where: { email },
    });

    if (invitee) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: invitee.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          {
            error: "already a member",
            message: "User is already a member of this workspace",
          },
          { status: 409 }
        );
      }
    }

    // 4. Generate new invite token and expiration date (7 days from now)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 5. Upsert workspace invite keyed on workspaceId_email
    const invite = await prisma.workspaceInvite.upsert({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
      update: {
        token,
        expiresAt,
        status: "PENDING",
        role,
        invitedById: session.user.id,
      },
      create: {
        workspaceId,
        email,
        role,
        token,
        invitedById: session.user.id,
        expiresAt,
        status: "PENDING",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${appUrl}/invite/${invite.token}`;

    return NextResponse.json({
      success: true,
      data: { inviteLink },
    });
  } catch (error) {
    console.error("Failed to generate/resend invite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    // 1. Verify that requester is an OWNER or ADMIN of the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (
      !member ||
      (member.role !== WorkspaceRole.OWNER &&
        member.role !== WorkspaceRole.ADMIN)
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only workspace owners and admins can revoke invites",
        },
        { status: 403 }
      );
    }

    // 2. Extract email from query parameter or body payload
    const { searchParams } = new URL(req.url);
    let email = searchParams.get("email");

    if (!email) {
      try {
        const body = await req.json();
        email = body.email;
      } catch {
        // Ignored
      }
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 3. Update invite status to REVOKED
    await prisma.workspaceInvite.update({
      where: {
        workspaceId_email: {
          workspaceId,
          email,
        },
      },
      data: {
        status: "REVOKED",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }
    console.error("Failed to revoke invite:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
