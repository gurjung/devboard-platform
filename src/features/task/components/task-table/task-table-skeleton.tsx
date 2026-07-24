"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskTableSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-background">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[40%] text-xs font-semibold">
              Title
            </TableHead>
            <TableHead className="w-[15%] text-xs font-semibold">
              Status
            </TableHead>
            <TableHead className="w-[15%] text-xs font-semibold">
              Priority
            </TableHead>
            <TableHead className="w-[15%] text-xs font-semibold">
              Assignee
            </TableHead>
            <TableHead className="w-[10%] text-xs font-semibold text-right">
              Due Date
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell className="align-middle">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-[60%] rounded-md" />
                  <Skeleton className="h-3.5 w-[40%] rounded-md" />
                </div>
              </TableCell>
              <TableCell className="align-middle">
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell className="align-middle">
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell className="align-middle">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </TableCell>
              <TableCell className="align-middle">
                <Skeleton className="h-4 w-16 ml-auto rounded-md" />
              </TableCell>
              <TableCell className="align-middle text-center">
                <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
