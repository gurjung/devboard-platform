"use client";

import React, { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { en } from "@/locales/en";

interface WorkspaceLogoUploaderProps {
  previewUrl: string | null;
  setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  initialLogoUrl?: string | null;
  disabled?: boolean;
  setFormValue: (value: string) => void;
  error?: string;
}

export function WorkspaceLogoUploader({
  previewUrl,
  setPreviewUrl,
  logoFile,
  setLogoFile,
  initialLogoUrl = null,
  disabled = false,
  setFormValue,
  error,
}: WorkspaceLogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    const validTypes = ["image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      toast.error(en.workspace.logoUploader.toastInvalidType);
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

      if (previewUrl && previewUrl !== initialLogoUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(compressedFile);
      setLogoFile(compressedFile);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error("Error compressing image:", err);
      toast.error(en.workspace.logoUploader.toastProcessError);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isCompressing) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isCompressing) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleRemoveLogo = () => {
    if (previewUrl && previewUrl !== initialLogoUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setLogoFile(null);
    setFormValue("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Field invalid={!!error}>
      <FieldLabel className="text-xs font-semibold">
        {en.workspace.logoUploader.label}{" "}
        <span className="font-normal text-muted-foreground">
          {en.workspace.logoUploader.optional}
        </span>
      </FieldLabel>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isCompressing}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex items-center gap-3.5 p-3 rounded-xl border border-dashed transition-colors duration-200",
          isDragging
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-border/80 bg-muted/20"
        )}
      >
        <Avatar className="h-12 w-12 rounded-xl shrink-0 ring-1 ring-border/50">
          {previewUrl ? (
            <AvatarImage
              src={previewUrl}
              alt={en.workspace.logoUploader.previewAlt}
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-muted/80 text-muted-foreground font-bold rounded-xl">
            {isCompressing ? (
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
              disabled={disabled || isCompressing}
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
                disabled={disabled || isCompressing}
                className="h-8 text-xs px-2.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                {en.workspace.logoUploader.remove}
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {en.workspace.logoUploader.hint}
          </p>
        </div>
      </div>
      <FieldError>{error}</FieldError>
    </Field>
  );
}
