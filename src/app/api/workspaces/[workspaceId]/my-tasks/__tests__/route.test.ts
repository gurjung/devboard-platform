/**
 * @jest-environment node
 */
import { GET } from "../route";
import { auth } from "@/auth";
import { getWorkspaceMembership } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/workspace-auth", () => ({
  getWorkspaceMembership: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("GET /api/workspaces/[workspaceId]/my-tasks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when session user is not authenticated", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const req = new Request(
      "http://localhost:3000/api/workspaces/ws-1/my-tasks"
    );
    const res = await GET(req, {
      params: Promise.resolve({ workspaceId: "ws-1" }),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 403 when user is not a member of the workspace", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (getWorkspaceMembership as jest.Mock).mockResolvedValue(null);

    const req = new Request(
      "http://localhost:3000/api/workspaces/ws-1/my-tasks"
    );
    const res = await GET(req, {
      params: Promise.resolve({ workspaceId: "ws-1" }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Forbidden");
  });

  it("queries tasks assigned to current user in the workspace with filters and pagination", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (getWorkspaceMembership as jest.Mock).mockResolvedValue({
      workspaceId: "ws-1",
      userId: "user-1",
      workspace: { id: "ws-1", slug: "ws-slug" },
    });

    const mockTasks = [
      {
        id: "task-1",
        title: "Task 1",
        status: "TODO",
        priority: "HIGH",
        project: { id: "p-1", name: "Project 1", slug: "project-1" },
        assignee: { id: "user-1", name: "User 1" },
        createdBy: { id: "user-2", name: "User 2" },
      },
    ];

    (prisma.task.findMany as jest.Mock).mockResolvedValue([...mockTasks]);
    (prisma.task.count as jest.Mock).mockResolvedValue(1);

    const req = new Request(
      "http://localhost:3000/api/workspaces/ws-1/my-tasks?status=TODO&priority=HIGH&pageSize=10"
    );
    const res = await GET(req, {
      params: Promise.resolve({ workspaceId: "ws-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toEqual(mockTasks);
    expect(body.totalCount).toBe(1);
    expect(body.nextCursor).toBeNull();

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assigneeId: "user-1",
          project: {
            workspaceId: "ws-1",
          },
          status: "TODO",
          priority: "HIGH",
        }),
        take: 11,
      })
    );
  });

  it("computes nextCursor when more tasks than pageSize exist", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (getWorkspaceMembership as jest.Mock).mockResolvedValue({
      workspaceId: "ws-1",
      userId: "user-1",
      workspace: { id: "ws-1", slug: "ws-slug" },
    });

    const returnedTasks = [
      { id: "task-1", title: "Task 1" },
      { id: "task-2", title: "Task 2" }, // extra task beyond pageSize=1
    ];

    (prisma.task.findMany as jest.Mock).mockResolvedValue([...returnedTasks]);
    (prisma.task.count as jest.Mock).mockResolvedValue(2);

    const req = new Request(
      "http://localhost:3000/api/workspaces/ws-1/my-tasks?pageSize=1"
    );
    const res = await GET(req, {
      params: Promise.resolve({ workspaceId: "ws-1" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tasks).toHaveLength(1);
    expect(body.tasks[0].id).toBe("task-1");
    expect(body.nextCursor).toBe("task-2");
  });
});
