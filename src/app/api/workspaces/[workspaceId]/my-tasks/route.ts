import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    workspaceId: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await params;

  try {
    const membership = await getWorkspaceMembership(workspaceId);

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const priority = searchParams.get("priority") || undefined;
    const dueDateParam = searchParams.get("dueDate") || undefined;
    const overdueParam =
      searchParams.get("overdue") === "true" || status === "OVERDUE";
    const cursor = searchParams.get("cursor") || undefined;
    const pageSizeParam = searchParams.get("pageSize");
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 20;

    const where: any = {
      assigneeId: session.user.id,
      project: {
        workspaceId: membership.workspace.id,
      },
    };

    if (status && status !== "OVERDUE") {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
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

    if (overdueParam) {
      const now = new Date();
      if (where.dueDate) {
        where.dueDate = {
          ...where.dueDate,
          lt: now,
        };
      } else {
        where.dueDate = {
          lt: now,
        };
      }

      if (where.status) {
        if (where.status === "DONE") {
          where.status = { in: [] };
        }
      } else {
        where.status = { not: "DONE" };
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
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
    console.error("Failed to fetch my tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
