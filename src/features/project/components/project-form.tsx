"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { createProjectSchema, type CreateProjectInput } from "../schema";
import { useUpdateProject } from "../hooks/use-update-project";
import { useDeleteProject } from "../hooks/use-delete-project";
import { ProjectLogoUploader } from "./project-logo-uploader";
import { ProjectDangerZone } from "./project-danger-zone";

interface ProjectFormProps {
  workspaceId: string;
  workspaceSlug: string;
  initialValues?: {
    id?: string;
    name?: string;
    logo?: string | null;
  };
  onCancel?: () => void;
  onSuccess?: (project: any) => void;
  onDelete?: () => Promise<void> | void;
  isDeleting?: boolean;
}

export function ProjectForm({
  workspaceId,
  workspaceSlug,
  initialValues,
  onCancel,
  onSuccess,
  onDelete,
  isDeleting = false,
}: ProjectFormProps) {
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues?.logo || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: initialValues?.name || "",
      logo: initialValues?.logo || "",
    },
  });

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const isDeletingState = isDeleting || deleteProjectMutation.isPending;

  const isSubmitting = isUploading || updateProjectMutation.isPending;

  const watchedName = form.watch("name");
  const hasNameChanged =
    (watchedName || "").trim() !== (initialValues?.name || "").trim();
  const hasLogoChanged =
    logoFile !== null || (previewUrl || null) !== (initialValues?.logo || null);
  const hasChanges = hasNameChanged || hasLogoChanged;

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

  const onSubmit = async (data: CreateProjectInput) => {
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
          throw new Error(json.message || en.project.form.toastUploadError);
        }

        uploadedUrl = json.url;
      } catch (err: any) {
        console.error("Error uploading logo:", err);
        const errorMessage =
          err?.message ||
          (typeof err === "string"
            ? err
            : en.project.form.toastUploadErrorRetry);
        toast.error(`Upload error: ${errorMessage}`);
        setIsUploading(false);
        return;
      }
    }

    if (initialValues?.id) {
      updateProjectMutation.mutate(
        {
          workspaceId,
          projectId: initialValues.id,
          data: { name: data.name, logo: uploadedUrl },
        },
        {
          onSuccess: (updated) => {
            toast.success(en.project.form.toastUpdateSuccess);
            if (onSuccess) {
              onSuccess(updated);
            }
            setIsUploading(false);
          },
          onError: (error) => {
            toast.error(error.message || en.project.form.toastUpdateError);
            setIsUploading(false);
          },
        }
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete();
    } else if (initialValues?.id) {
      deleteProjectMutation.mutate(
        { workspaceId, projectId: initialValues.id },
        {
          onSuccess: () => {
            toast.success(en.project.form.toastDeleteSuccess);
            router.push(`/dashboard/${workspaceSlug}`);
          },
          onError: (error) => {
            toast.error(error.message || en.project.form.toastDeleteError);
          },
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      <Card className="w-full rounded-2xl border border-border/80 shadow-md bg-card">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-4">
              {/* Project Name */}
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold">
                      {en.project.form.nameLabel}
                    </FieldLabel>
                    <Input
                      type="text"
                      placeholder={en.project.form.namePlaceholder}
                      className="w-full h-10 text-sm rounded-xl"
                      aria-invalid={!!fieldState.error}
                      disabled={isSubmitting}
                      {...field}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              {/* Project Logo Upload */}
              <Controller
                control={form.control}
                name="logo"
                render={({ fieldState }) => (
                  <ProjectLogoUploader
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel || handleReset}
                  disabled={!hasChanges || isSubmitting}
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {en.project.form.cancelButton}
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !hasChanges}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading
                        ? en.project.form.uploadingButton
                        : en.project.form.savingButton}
                    </>
                  ) : (
                    en.project.form.saveButton
                  )}
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* Delete Danger Zone */}
      {initialValues?.id && (
        <ProjectDangerZone
          onDelete={handleConfirmDelete}
          isLoading={isDeletingState}
          disabled={isSubmitting}
        />
      )}
    </div>
  );
}
