"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeneratedInviteView } from "./generated-invite-view";
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
        <GeneratedInviteView inviteLink={inviteLink} onClose={handleClose} />
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
