"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarIcon,
  Trash,
  Loader2,
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
  X,
} from "lucide-react";
import { format } from "date-fns";

import { FormDialog } from "@/components/shared/form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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

import { updateTaskSchema, type UpdateTaskInput } from "../schema";
import { useUpdateTask } from "../hooks/use-update-task";
import { useDeleteTask } from "../hooks/use-delete-task";
import { useWorkspaceMembers } from "@/features/workspace/hooks/members/use-workspace-members";
import { TaskWithAssignee } from "../hooks/use-tasks";
import { WorkspaceMembershipResult } from "@/lib/workspace-auth";

interface EditTaskDialogProps {
  projectId: string;
  workspaceId: string;
  task: TaskWithAssignee;
  membership: WorkspaceMembershipResult["membership"];
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

export function EditTaskDialog({
  projectId,
  workspaceId,
  task,
  membership,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const { data: members = [] } = useWorkspaceMembers(workspaceId);
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const form = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      assigneeId: task.assigneeId || null,
    },
  });

  // Reset values when task changes
  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assigneeId: task.assigneeId || null,
      });
    }
  }, [open, task, form]);

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (data: UpdateTaskInput) => {
    updateTaskMutation.mutate(
      { taskId: task.id, data },
      {
        onSuccess: () => {
          toast.success("Task updated successfully");
          handleClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update task");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted successfully");
        setIsConfirmDeleteOpen(false);
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete task");
      },
    });
  };

  const isSubmitting = updateTaskMutation.isPending;
  const isDeleting = deleteTaskMutation.isPending;

  // Creator or OWNER/ADMIN can delete
  const canDelete =
    task.createdById === membership.userId ||
    membership.role === "OWNER" ||
    membership.role === "ADMIN";

  return (
    <>
      <FormDialog
        title="Edit Task"
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
                                    <AvatarImage
                                      src={member.user.image || ""}
                                    />
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
                            className="w-full h-10 px-3 bg-background border border-border/80 hover:border-border rounded-xl text-left font-normal text-xs hover:border-border focus:ring-2 focus:ring-primary/20 cursor-pointer transition-colors flex items-center justify-between gap-2"
                          />
                        }
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                        </div>
                        {field.value && (
                          <span
                            role="button"
                            tabIndex={0}
                            className="h-5 w-5 rounded-full hover:bg-muted/80 flex items-center justify-center cursor-pointer text-muted-foreground/60 hover:text-foreground/80 transition-colors shrink-0 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              field.onChange(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                e.preventDefault();
                                field.onChange(null);
                              }
                            }}
                            title="Clear date"
                          >
                            <X className="h-3 w-3" />
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

            {/* Custom footer actions for editing & deleting */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-2">
              {canDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  disabled={isSubmitting || isDeleting}
                  className="h-9 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl px-3 cursor-pointer gap-1.5"
                >
                  <Trash className="h-4 w-4" />
                  Delete Task
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting || isDeleting}
                  className="h-9 text-xs rounded-xl px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || isDeleting || !form.formState.isDirty
                  }
                  className="h-9 text-xs rounded-xl px-4 cursor-pointer"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </FieldGroup>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
