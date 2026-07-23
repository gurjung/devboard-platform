"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { en } from "@/locales/en";

import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "../../schema";
import { useCreateWorkspace } from "../../hooks/settings/use-create-workspace";

interface CreateWorkspaceDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CreateWorkspaceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      logo: "",
    },
  });

  const createWorkspaceMutation = useCreateWorkspace();
  const isSubmitting =
    isCompressing || isUploading || createWorkspaceMutation.isPending;

  const handleReset = () => {
    form.reset();
    setIsCompressing(false);
    setIsUploading(false);
    setLogoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error(en.workspace.createDialog.toastImageError);
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

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      setLogoFile(compressedFile);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error("Error compressing image:", err);
      toast.error(en.workspace.createDialog.toastProcessError);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveLogo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLogoFile(null);
    form.setValue("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: CreateWorkspaceInput) => {
    let uploadedUrl: string | undefined = undefined;

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
          throw new Error(json.message || en.workspace.createDialog.toastError);
        }

        uploadedUrl = json.url;
      } catch (err: any) {
        console.error("Error uploading logo:", err);
        const errorMessage =
          err?.message ||
          (typeof err === "string"
            ? err
            : en.workspace.form.toastUploadErrorRetry);
        toast.error(`Upload error: ${errorMessage}`);
        setIsUploading(false);
        return;
      }
    }

    createWorkspaceMutation.mutate(
      { name: data.name, logo: uploadedUrl },
      {
        onSuccess: (newWorkspace) => {
          toast.success(en.workspace.createDialog.toastSuccess);
          handleClose();
          router.push(`/dashboard/${newWorkspace.slug}`);
        },
        onError: (error) => {
          toast.error(error.message || en.workspace.createDialog.toastError);
          setIsUploading(false);
        },
      }
    );
  };

  return (
    <FormDialog
      trigger={children}
      title={en.workspace.createDialog.title}
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel>{en.workspace.createDialog.nameLabel}</FieldLabel>
                <Input
                  type="text"
                  placeholder={en.workspace.createDialog.namePlaceholder}
                  className="w-full"
                  aria-invalid={!!fieldState.error}
                  disabled={isSubmitting}
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="logo"
            render={({ fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel className="text-xs font-semibold flex items-center justify-between w-full">
                  <span>{en.workspace.createDialog.logoLabel}</span>
                  <span className="font-normal text-muted-foreground text-[11px]">
                    {en.workspace.createDialog.logoOptional}
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
                            {en.workspace.logoUploader.compressing}
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                            {previewUrl
                              ? en.workspace.logoUploader.changeLogo
                              : en.workspace.logoUploader.selectImage}
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
                          {en.workspace.logoUploader.remove}
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {en.workspace.createDialog.logoHint}
                    </p>
                  </div>
                </div>
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <DialogActions
            completeLabel={en.workspace.createDialog.createButton}
            completeLoadingLabel={
              isUploading
                ? en.workspace.createDialog.uploadingButton
                : en.workspace.createDialog.creatingButton
            }
            onCancel={handleClose}
            isCompleteLoading={isSubmitting}
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
