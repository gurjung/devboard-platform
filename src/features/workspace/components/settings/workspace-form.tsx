"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "../../schema";
import { useCreateWorkspace } from "../../hooks/settings/use-create-workspace";
import { useUpdateWorkspace } from "../../hooks/settings/use-update-workspace";
import { useDeleteWorkspace } from "../../hooks/settings/use-delete-workspace";
import { InviteMemberDialog } from "../invite/invite-member-dialog";
import { WorkspaceLogoUploader } from "./workspace-logo-uploader";
import { WorkspaceDangerZone } from "./workspace-danger-zone";

interface WorkspaceFormProps {
  initialValues?: {
    id?: string;
    name?: string;
    logo?: string | null;
  };
  mode?: "create" | "edit";
  onCancel?: () => void;
  onSuccess?: (workspace: any) => void;
  onDelete?: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function WorkspaceForm({
  initialValues,
  mode = "create",
  onCancel,
  onSuccess,
  onDelete,
  isDeleting = false,
}: WorkspaceFormProps) {
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues?.logo || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: initialValues?.name || "",
      logo: initialValues?.logo || "",
    },
  });

  const createWorkspaceMutation = useCreateWorkspace();
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const isDeletingState = isDeleting || deleteWorkspaceMutation.isPending;

  const isSubmitting =
    isUploading ||
    createWorkspaceMutation.isPending ||
    updateWorkspaceMutation.isPending;

  const watchedName = form.watch("name");
  const hasNameChanged =
    (watchedName || "").trim() !== (initialValues?.name || "").trim();
  const hasLogoChanged =
    logoFile !== null || (previewUrl || null) !== (initialValues?.logo || null);
  const hasChanges = mode === "edit" ? hasNameChanged || hasLogoChanged : true;

  const handleReset = () => {
    form.reset({
      name: initialValues?.name || "",
      logo: initialValues?.logo || "",
    });
    setIsUploading(false);
    setLogoFile(null);
    if (previewUrl && previewUrl !== initialValues?.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(initialValues?.logo || null);
  };

  const onSubmit = async (data: CreateWorkspaceInput) => {
    let uploadedUrl: string | undefined = previewUrl || undefined;

    if (logoFile) {
      try {
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", logoFile, logoFile.name);

        const response = await fetch("/api/workspaces/upload-logo", {
          method: "POST",
          body: formData,
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || "Failed to upload logo.");
        }

        uploadedUrl = json.url;
      } catch (err: any) {
        console.error("Error uploading logo:", err);
        const errorMessage =
          err?.message ||
          (typeof err === "string"
            ? err
            : "Failed to upload logo. Please try again.");
        toast.error(`Upload error: ${errorMessage}`);
        setIsUploading(false);
        return;
      }
    }

    if (mode === "create") {
      createWorkspaceMutation.mutate(
        { name: data.name, logo: uploadedUrl },
        {
          onSuccess: (newWorkspace) => {
            toast.success("Workspace created successfully!");
            handleReset();
            if (onSuccess) {
              onSuccess(newWorkspace);
            } else {
              router.push(`/dashboard/${newWorkspace.slug}`);
            }
          },
          onError: (error) => {
            toast.error(error.message || "Failed to create workspace");
            setIsUploading(false);
          },
        },
      );
    } else if (initialValues?.id) {
      updateWorkspaceMutation.mutate(
        { id: initialValues.id, data: { name: data.name, logo: uploadedUrl } },
        {
          onSuccess: (updated) => {
            toast.success("Workspace updated successfully!");
            if (onSuccess) {
              onSuccess(updated);
            }
            setIsUploading(false);
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update workspace");
            setIsUploading(false);
          },
        },
      );
    } else {
      if (onSuccess) {
        onSuccess({ name: data.name, logo: uploadedUrl });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete();
    } else if (initialValues?.id) {
      deleteWorkspaceMutation.mutate(
        { id: initialValues.id },
        {
          onSuccess: () => {
            toast.success("Workspace deleted successfully!");
            router.push("/dashboard");
          },
          onError: (error) => {
            toast.error(error.message || "Failed to delete workspace");
          },
        },
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Main Workspace Form Card */}
      <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
        {mode === "create" && (
          <>
            <CardHeader className="flex flex-col items-center justify-center text-center p-6 pb-4">
              <CardTitle className="text-xl font-bold text-foreground">
                Create a new workspace
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1 text-center">
                Workspaces are shared environments where team members can
                collaborate on projects.
              </CardDescription>
            </CardHeader>
            <div className="px-6">
              <Separator />
            </div>
          </>
        )}

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              {/* Workspace Name */}
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold">
                      Workspace Name
                    </FieldLabel>
                    <Input
                      type="text"
                      placeholder="Enter workspace name"
                      className="w-full h-10 text-sm rounded-xl"
                      aria-invalid={!!fieldState.error}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Workspace Logo Upload */}
              <Controller
                control={form.control}
                name="logo"
                render={({ fieldState }) => (
                  <WorkspaceLogoUploader
                    previewUrl={previewUrl}
                    setPreviewUrl={setPreviewUrl}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    initialLogoUrl={initialValues?.logo}
                    disabled={isSubmitting}
                    setFormValue={(val) => form.setValue("logo", val)}
                    error={fieldState.error?.message}
                  />
                )}
              />

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/80">
                {onCancel ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="cursor-pointer h-9 px-4 rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                ) : mode === "edit" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={!hasChanges || isSubmitting}
                    className="cursor-pointer h-9 px-4 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Button>
                ) : mode === "create" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs h-9"
                  >
                    Sign out
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || (mode === "edit" && !hasChanges)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading
                        ? "Uploading logo..."
                        : mode === "create"
                          ? "Creating..."
                          : "Saving..."}
                    </>
                  ) : mode === "create" ? (
                    "Create Workspace"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Members & Collaboration Card */}
      {mode === "edit" && initialValues?.id && (
        <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider text-center">
              Members & Collaboration
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1 text-center">
              Invite new members to collaborate on projects and manage team access.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex justify-center">
            <InviteMemberDialog workspaceId={initialValues.id}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full max-w-xs cursor-pointer h-9 rounded-xl text-xs font-medium border-border/80 hover:bg-muted"
              >
                Invite Member
              </Button>
            </InviteMemberDialog>
          </CardContent>
        </Card>
      )}

      {/* Delete Danger Zone (Separate Card below Edit Workspace) */}
      {mode === "edit" && (onDelete || initialValues?.id) && (
        <WorkspaceDangerZone
          onDelete={handleConfirmDelete}
          isLoading={isDeletingState}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}
