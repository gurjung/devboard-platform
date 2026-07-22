"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteMemberSchema, type InviteMemberInput } from "../schema";
import { useInviteMember } from "../hooks/use-invite-member";

interface InviteMemberDialogProps {
  children?: React.ReactNode;
  workspaceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteMemberDialog({
  children,
  workspaceId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InviteMemberDialogProps) {
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

  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  const inviteMemberMutation = useInviteMember();
  const isSubmitting = inviteMemberMutation.isPending;

  const handleReset = () => {
    form.reset();
    setInviteLink(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    setOpen(false);
  };

  const onSubmit = (data: InviteMemberInput) => {
    inviteMemberMutation.mutate(
      { workspaceId, data },
      {
        onSuccess: (res) => {
          if (res.success && res.data?.inviteLink) {
            setInviteLink(res.data.inviteLink);
            toast.success("Invitation generated successfully!");
          } else {
            toast.error("Failed to generate invitation link");
          }
        },
        onError: (error: any) => {
          let errMsg = error.message || "Failed to invite member. Please try again.";
          if (error.status === 409) {
            errMsg = error.message || "This user is already a member.";
            form.setError("email", { message: errMsg });
          } else if (error.status === 403) {
            errMsg = "You do not have permission to invite members.";
            form.setError("root", { message: errMsg });
          } else {
            form.setError("root", { message: errMsg });
          }
          toast.error(errMsg);
        },
      }
    );
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <FormDialog
      trigger={children}
      title="Invite Team Member"
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      {inviteLink ? (
        <div className="space-y-5 py-2 flex flex-col items-center text-center">
          {/* Visual premium indicator */}
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Check className="size-5" />
          </div>

          <div className="space-y-1.5 text-center">
            <h3 className="text-sm font-semibold text-foreground">
              Invite Link Generated
            </h3>
            <p className="text-xs text-muted-foreground leading-normal max-w-xs mx-auto">
              Copy and share this unique link with the user to invite them to this workspace. It expires in 7 days.
            </p>
          </div>

          <div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-center">
            <Input
              value={inviteLink}
              readOnly
              className="w-full sm:flex-1 text-xs h-9 rounded-xl bg-muted/30 focus-visible:ring-0 text-center sm:text-left"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="w-full sm:w-auto shrink-0 h-9 text-xs rounded-xl px-3 flex items-center justify-center gap-1.5 cursor-pointer border-border/80"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-muted-foreground" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          <div className="w-full pt-4 border-t border-border/80 flex justify-center">
            <Button
              type="button"
              size="sm"
              onClick={handleClose}
              className="w-full sm:w-28 h-9 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            {form.formState.errors.root && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                {form.formState.errors.root.message}
              </div>
            )}

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-semibold">
                    Email Address
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full h-10 text-sm rounded-xl"
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
              name="role"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-semibold">Role</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full h-10 px-3 bg-input/20 border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="w-(--anchor-width) min-w-44 p-1 rounded-xl shadow-md border border-border/80">
                      <SelectGroup>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <DialogActions
              completeLabel="Generate Invite"
              completeLoadingLabel="Generating..."
              onCancel={handleClose}
              isCompleteLoading={isSubmitting}
            />
          </FieldGroup>
        </form>
      )}
    </FormDialog>
  );
}
