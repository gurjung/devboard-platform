import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/features/task/schema";
import { WorkspaceRole } from "@prisma/client";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    projectId: string;
    taskId: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, taskId } = await params;

  try {
    // Find task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task || task.projectId !== projectId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get requester's role in the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.project.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace" },
        { status: 403 }
      );
    }

    // Check permissions: creator, current assignee, or OWNER/ADMIN in workspace
    const isCreator = task.createdById === session.user.id;
    const isAssignee = task.assigneeId === session.user.id;
    const isWorkspaceAdminOrOwner =
      member.role === WorkspaceRole.OWNER ||
      member.role === WorkspaceRole.ADMIN;

    if (!isCreator && !isAssignee && !isWorkspaceAdminOrOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to update this task" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate, assigneeId } =
      parsed.data;

    // Validate assigneeId if it is being changed and is not null/undefined
    if (
      assigneeId !== undefined &&
      assigneeId !== null &&
      assigneeId !== task.assigneeId
    ) {
      const assigneeMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: task.project.workspaceId,
            userId: assigneeId,
          },
        },
      });

      if (!assigneeMember) {
        return NextResponse.json(
          {
            error:
              "Invalid assignee: Assignee must be a member of the workspace",
          },
          { status: 400 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : undefined,
        description:
          description !== undefined ? description || null : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        dueDate: dueDate !== undefined ? dueDate || null : undefined,
        assigneeId: assigneeId !== undefined ? assigneeId || null : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Failed to update task:", error);
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

  const { projectId, taskId } = await params;

  try {
    // Find task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task || task.projectId !== projectId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get requester's role in the workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: task.project.workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace" },
        { status: 403 }
      );
    }

    // Check permissions: creator, or OWNER/ADMIN in workspace (NOT assignee)
    const isCreator = task.createdById === session.user.id;
    const isWorkspaceAdminOrOwner =
      member.role === WorkspaceRole.OWNER ||
      member.role === WorkspaceRole.ADMIN;

    if (!isCreator && !isWorkspaceAdminOrOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this task" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
