import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    workspaceId: string;
    memberId: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, memberId } = await params;

  try {
    const { role } = await req.json();

    if (!role || !Object.values(WorkspaceRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role value provided" },
        { status: 400 }
      );
    }

    // 1. Verify requester's membership and role
    const requester = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!requester) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace" },
        { status: 403 }
      );
    }

    // 2. Fetch the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Member not found in this workspace" },
        { status: 404 }
      );
    }

    // 3. Role update permission validation rules
    if (requester.role === WorkspaceRole.MEMBER) {
      return NextResponse.json(
        { error: "Forbidden: Members cannot modify roles" },
        { status: 403 }
      );
    }

    if (requester.role === WorkspaceRole.ADMIN) {
      // Admins cannot change/edit Owners
      if (targetMember.role === WorkspaceRole.OWNER) {
        return NextResponse.json(
          { error: "Forbidden: Admins cannot modify owners" },
          { status: 403 }
        );
      }
      // Admins cannot promote anyone to Owner
      if (role === WorkspaceRole.OWNER) {
        return NextResponse.json(
          { error: "Forbidden: Admins cannot promote members to OWNER" },
          { status: 403 }
        );
      }
    }

    // If requester is OWNER
    if (requester.role === WorkspaceRole.OWNER) {
      // Owner cannot demote themselves directly
      if (targetMember.id === requester.id && role !== WorkspaceRole.OWNER) {
        return NextResponse.json(
          { error: "Bad Request: You cannot demote yourself. Transfer ownership instead." },
          { status: 400 }
        );
      }

      // Transfer ownership scenario:
      if (role === WorkspaceRole.OWNER && targetMember.id !== requester.id) {
        const updatedTarget = await prisma.$transaction(async (tx) => {
          // Demote current owner to ADMIN
          await tx.workspaceMember.update({
            where: { id: requester.id },
            data: { role: WorkspaceRole.ADMIN },
          });

          // Promote target member to OWNER
          return await tx.workspaceMember.update({
            where: { id: memberId },
            data: { role: WorkspaceRole.OWNER },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          });
        });

        return NextResponse.json({
          success: true,
          data: updatedTarget,
        });
      }
    }

    // Standard role update (OWNER updating ADMIN/MEMBER, or ADMIN updating ADMIN/MEMBER)
    const updatedMember = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    console.error("Failed to update workspace member role:", error);
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

  const { workspaceId, memberId } = await params;

  try {
    // 1. Verify requester's membership and role
    const requester = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!requester || requester.role !== WorkspaceRole.OWNER) {
      return NextResponse.json(
        { error: "Forbidden: Only workspace owners can delete members" },
        { status: 403 }
      );
    }

    // 2. Fetch the target member
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Member not found in this workspace" },
        { status: 404 }
      );
    }

    // 3. Verify that owner is not deleting themselves
    if (targetMember.id === requester.id) {
      return NextResponse.json(
        { error: "Bad Request: Owners cannot remove themselves. Transfer ownership or delete workspace first." },
        { status: 400 }
      );
    }

    // 4. Delete member
    await prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to delete workspace member:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
