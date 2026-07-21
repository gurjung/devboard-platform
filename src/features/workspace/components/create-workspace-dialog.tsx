"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";

import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createWorkspaceSchema, CreateWorkspaceInput } from "../schema";
import { useCreateWorkspace } from "../hooks/use-create-workspace";

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateWorkspaceInput>({
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
    reset();
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

      if (previewUrl) {
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setLogoFile(null);
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

    createWorkspaceMutation.mutate(
      { name: data.name, logo: uploadedUrl },
      {
        onSuccess: (newWorkspace) => {
          toast.success("Workspace created!");
          handleClose();
          router.push(`/dashboard/${newWorkspace.slug}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create workspace");
          setIsUploading(false);
        },
      },
    );
  };

  return (
    <FormDialog
      trigger={children}
      title="Create Workspace"
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="workspace-name"
            className="text-xs font-semibold text-foreground"
          >
            Workspace Name
          </Label>
          <Input
            id="workspace-name"
            placeholder="Acme Inc."
            {...register("name")}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-semibold text-foreground">
            Workspace Logo{" "}
            <span className="font-normal text-muted-foreground">
              (Optional)
            </span>
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-3.5 p-3 rounded-xl border border-dashed border-border/80 bg-muted/20">
            <Avatar className="h-14 w-14 rounded-xl shrink-0">
              {previewUrl ? (
                <AvatarImage
                  src={previewUrl}
                  alt="Logo preview"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-muted/60">
                {isCompressing || isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground/70" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isSubmitting}
                  className="h-8 text-xs px-3 rounded-lg"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {previewUrl ? "Change image" : "Select image"}
                    </>
                  )}
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLogo();
                    }}
                    disabled={isSubmitting}
                    className="h-8 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground"
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
          {errors.logo && (
            <p className="text-xs text-destructive">{errors.logo.message}</p>
          )}
        </div>

        <DialogActions
          completeLabel="Create workspace"
          completeLoadingLabel={
            isUploading ? "Uploading logo..." : "Creating workspace..."
          }
          onCancel={handleClose}
          isCompleteLoading={isSubmitting}
        />
      </form>
    </FormDialog>
  );
}
