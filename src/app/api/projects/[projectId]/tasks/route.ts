import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/features/task/schema";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    // Verify the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify user is member of project's workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const assigneeId = searchParams.get("assigneeId") || undefined;
    const dueDateParam = searchParams.get("dueDate") || undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const pageSizeParam = searchParams.get("pageSize");
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;

    const where: any = {
      projectId,
    };

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assigneeId) {
      where.assigneeId =
        assigneeId === "null" || assigneeId === "unassigned"
          ? null
          : assigneeId;
    }
    if (dueDateParam) {
      const date = new Date(dueDateParam);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);
        where.dueDate = {
          lte: endOfDay,
        };
      }
    }

    const take = pageSize;
    const tasks = await prisma.task.findMany({
      where,
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
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

    let nextCursor: string | null = null;
    if (tasks.length > take) {
      const nextTask = tasks.pop();
      nextCursor = nextTask ? nextTask.id : null;
    }

    const totalCount = await prisma.task.count({ where });

    return NextResponse.json({
      tasks,
      nextCursor,
      totalCount,
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  try {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Verify requester is a workspace member (any role)
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
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

    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, description, status, priority, dueDate, assigneeId } =
      parsed.data;

    // Verify assignee belongs to the workspace
    if (assigneeId) {
      const assigneeMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: project.workspaceId,
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

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate || null,
        projectId,
        assigneeId: assigneeId || null,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
