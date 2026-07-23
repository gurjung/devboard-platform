import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateProject } from "../use-create-project";
import { useUpdateProject } from "../use-update-project";
import { useDeleteProject } from "../use-delete-project";
import { useProjects } from "../use-projects";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("Project hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe("useCreateProject", () => {
    it("sends POST request to create project and invalidates query cache on success", async () => {
      const mockResponse = { id: "p1", name: "New Project" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const { queryClient, wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate({
        workspaceId: "w1",
        data: { name: "New Project" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workspaces/w1/projects",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "New Project" }),
        })
      );

      expect(result.current.data).toEqual(mockResponse);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "w1"],
      });
    });

    it("throws error when API returns error message", async () => {
      const mockErrorResponse = { message: "Internal Server Error" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      });

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useCreateProject(), { wrapper });

      result.current.mutate({
        workspaceId: "w1",
        data: { name: "New Project" },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Internal Server Error");
    });
  });

  describe("useUpdateProject", () => {
    it("sends PATCH request to update project and invalidates cache keys on success", async () => {
      const mockResponse = { id: "p1", name: "Updated Project" };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const { queryClient, wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateProject(), { wrapper });

      result.current.mutate({
        workspaceId: "w1",
        projectId: "p1",
        data: { name: "Updated Project" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workspaces/w1/projects/p1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated Project" }),
        })
      );

      expect(result.current.data).toEqual(mockResponse);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "w1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["project", "p1"],
      });
    });
  });

  describe("useDeleteProject", () => {
    it("sends DELETE request to remove project and invalidates caches on success", async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const { queryClient, wrapper } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeleteProject(), { wrapper });

      result.current.mutate({
        workspaceId: "w1",
        projectId: "p1",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workspaces/w1/projects/p1",
        expect.objectContaining({
          method: "DELETE",
        })
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["projects", "w1"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["project", "p1"],
      });
    });
  });

  describe("useProjects", () => {
    it("fetches list of projects correctly for a given workspaceId", async () => {
      const mockResponse = [
        { id: "p1", name: "Project One" },
        { id: "p2", name: "Project Two" },
      ];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useProjects("w1"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith("/api/workspaces/w1/projects");
      expect(result.current.data).toEqual(mockResponse);
    });
  });
});
