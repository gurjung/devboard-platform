"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "../schema";
import { useCreateWorkspace } from "../hooks/use-create-workspace";
import { useUpdateWorkspace } from "../hooks/use-update-workspace";
import { useDeleteWorkspace } from "../hooks/use-delete-workspace";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InviteMemberDialog } from "./invite-member-dialog";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues?.logo || null,
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
    isCompressing ||
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
    setIsCompressing(false);
    setIsUploading(false);
    setLogoFile(null);
    if (previewUrl && previewUrl !== initialValues?.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(initialValues?.logo || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a PNG or JPEG image.");
      return;
    }

    try {
      setIsCompressing(true);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      if (previewUrl && previewUrl !== initialValues?.logo) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      setLogoFile(compressedFile);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error("Error compressing image:", err);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveLogo = () => {
    if (previewUrl && previewUrl !== initialValues?.logo) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setLogoFile(null);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      setConfirmDeleteOpen(false);
    } else if (initialValues?.id) {
      deleteWorkspaceMutation.mutate(
        { id: initialValues.id },
        {
          onSuccess: () => {
            toast.success("Workspace deleted successfully!");
            setConfirmDeleteOpen(false);
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
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold">
                      Workspace Logo{" "}
                      <span className="font-normal text-muted-foreground">
                        (Optional)
                      </span>
                    </FieldLabel>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div className="flex items-center gap-3.5 p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
                      <Avatar className="h-12 w-12 rounded-xl shrink-0 ring-1 ring-border/50">
                        {previewUrl ? (
                          <AvatarImage
                            src={previewUrl}
                            alt="Logo preview"
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-muted/80 text-muted-foreground font-bold rounded-xl">
                          {isCompressing || isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted-foreground/70" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSubmitting}
                            className="h-8 text-xs px-3 rounded-lg cursor-pointer"
                          >
                            {isCompressing ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                Compressing...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                {previewUrl ? "Change logo" : "Select image"}
                              </>
                            )}
                          </Button>
                          {previewUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={isSubmitting}
                              className="h-8 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          PNG, JPEG (Max 1MB compressed)
                        </p>
                      </div>
                    </div>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
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
        <Card className="w-full rounded-2xl border border-red-500/20 dark:border-red-900/30 bg-red-500/[0.04] dark:bg-red-950/20 shadow-md">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-center">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Permanently delete this workspace and all associated projects and
              data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isDeletingState || isSubmitting}
              className="w-full max-w-xs cursor-pointer h-9 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white dark:bg-red-600 dark:hover:bg-red-700 shadow-xs transition-colors"
            >
              {isDeletingState ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workspace
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Workspace"
        description="Are you sure you want to proceed?"
        confirmLabel="Delete Workspace"
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingState}
        variant="danger"
      />
    </div>
  );
}
