"use client";

import * as React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarIcon,
  HelpCircle,
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { format } from "date-fns";

import { FormDialog } from "@/components/shared/form-dialog";
import { DialogActions } from "@/components/shared/dialog-actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { createTaskSchema, type CreateTaskInput } from "../schema";
import { useCreateTask } from "../hooks/use-create-task";
import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";

interface CreateTaskDialogProps {
  projectId: string;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const statusIcons: Record<string, React.ReactNode> = {
  BACKLOG: (
    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
  ),
  TODO: <Circle className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />,
  IN_PROGRESS: <CircleDot className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
  IN_REVIEW: <Eye className="h-3.5 w-3.5 text-purple-500 shrink-0" />,
  DONE: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />,
};

const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const priorityIcons: Record<string, React.ReactNode> = {
  LOW: <ArrowDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />,
  MEDIUM: <ArrowRight className="h-3.5 w-3.5 text-blue-500 shrink-0" />,
  HIGH: <ArrowUp className="h-3.5 w-3.5 text-orange-500 shrink-0" />,
  URGENT: <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />,
};

export function CreateTaskDialog({
  projectId,
  workspaceId,
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  const createTaskMutation = useCreateTask(projectId);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "BACKLOG",
      priority: "MEDIUM",
      dueDate: null,
      assigneeId: null,
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (data: CreateTaskInput) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Task created successfully");
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create task");
      },
    });
  };

  const isSubmitting = createTaskMutation.isPending;

  return (
    <FormDialog
      title="Create New Task"
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel className="text-xs font-semibold text-foreground">
                  Title
                </FieldLabel>
                <Input
                  type="text"
                  placeholder="Task title"
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border transition-colors duration-150"
                  {...field}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Field invalid={!!fieldState.error}>
                <FieldLabel className="text-xs font-semibold text-foreground">
                  Description
                </FieldLabel>
                <Textarea
                  placeholder="Task description (optional)"
                  disabled={isSubmitting}
                  className="w-full min-h-[90px] p-3 bg-background border border-border/80 rounded-xl focus:ring-2 focus:ring-primary/20 hover:border-border transition-colors duration-150 text-sm"
                  {...field}
                  value={field.value || ""}
                />
                <FieldError>{fieldState.error?.message}</FieldError>
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-semibold text-foreground">
                    Status
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full !h-10 px-3 bg-background border border-border/80 hover:border-border !rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer flex items-center gap-2 transition-colors duration-150 !text-xs">
                      {field.value && statusIcons[field.value]}
                      <SelectValue placeholder="Select status">
                        {field.value
                          ? statusLabels[field.value]
                          : "Select status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="p-1 rounded-xl shadow-md border border-border/80">
                      <SelectGroup>
                        <SelectItem value="BACKLOG">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>Backlog</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="TODO">
                          <div className="flex items-center gap-2">
                            <Circle className="h-3.5 w-3.5 text-muted-foreground/80" />
                            <span>Todo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <div className="flex items-center gap-2">
                            <CircleDot className="h-3.5 w-3.5 text-amber-500" />
                            <span>In Progress</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="IN_REVIEW">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3.5 w-3.5 text-purple-500" />
                            <span>In Review</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="DONE">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Done</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-semibold text-foreground">
                    Priority
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full !h-10 px-3 bg-background border border-border/80 hover:border-border !rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer flex items-center gap-2 transition-colors duration-150 !text-xs">
                      {field.value && priorityIcons[field.value]}
                      <SelectValue placeholder="Select priority">
                        {field.value
                          ? priorityLabels[field.value]
                          : "Select priority"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="p-1 rounded-xl shadow-md border border-border/80">
                      <SelectGroup>
                        <SelectItem value="LOW">
                          <div className="flex items-center gap-2">
                            <ArrowDown className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Low</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <div className="flex items-center gap-2">
                            <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                            <span>High</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="URGENT">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            <span>Urgent</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="assigneeId"
              render={({ field, fieldState }) => {
                const selectedMember = members.find(
                  (m) => m.user.id === field.value
                );

                return (
                  <Field invalid={!!fieldState.error}>
                    <FieldLabel className="text-xs font-semibold text-foreground">
                      Assignee
                    </FieldLabel>
                    <Select
                      value={field.value || "unassigned"}
                      onValueChange={(val) =>
                        field.onChange(val === "unassigned" ? null : val)
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full !h-10 px-3 bg-background border border-border/80 hover:border-border !rounded-xl focus:ring-2 focus:ring-primary/20 cursor-pointer flex items-center gap-2 transition-colors duration-150 !text-xs">
                        {selectedMember ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-4.5 w-4.5">
                              <AvatarImage
                                src={selectedMember.user.image || ""}
                              />
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                                {selectedMember.user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">
                              {selectedMember.user.name ||
                                selectedMember.user.email}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserX className="h-3.5 w-3.5" />
                            <span>Unassigned</span>
                          </div>
                        )}
                        <SelectValue
                          className="hidden !hidden"
                          placeholder="Unassigned"
                          style={{ display: "none" }}
                        />
                      </SelectTrigger>
                      <SelectContent className="p-1 rounded-xl shadow-md border border-border/80 min-w-[200px]">
                        <SelectGroup>
                          <SelectItem value="unassigned">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <UserX className="h-3.5 w-3.5" />
                              <span>Unassigned</span>
                            </div>
                          </SelectItem>
                          {members.map((member) => (
                            <SelectItem
                              key={member.user.id}
                              value={member.user.id}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={member.user.image || ""} />
                                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                                    {member.user.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">
                                  {member.user.name || member.user.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                );
              }}
            />

            <Controller
              control={form.control}
              name="dueDate"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel className="text-xs font-semibold text-foreground">
                    Due Date
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          disabled={isSubmitting}
                          className="w-full h-10 px-3 bg-background border border-border/80 hover:border-border rounded-xl text-left font-normal text-xs hover:border-border focus:ring-2 focus:ring-primary/20 cursor-pointer gap-2 transition-colors"
                        />
                      }
                    >
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border border-border/80 rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => field.onChange(date || null)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </div>

          <DialogActions
            completeLabel="Create Task"
            completeLoadingLabel="Creating..."
            onCancel={handleClose}
            isCompleteLoading={isSubmitting}
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
