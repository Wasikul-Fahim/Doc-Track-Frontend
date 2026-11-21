"use client";

import * as React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";
import { formatDate } from "@/lib/utils";
import type { PatientStatus } from "@/lib/types";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T extends { _id: string }> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: Error | null;
  empty?: React.ReactNode;
  onRetry?: () => void;
  rowActions?: (row: T) => React.ReactNode;
  actionsHeader?: string;
  skeletonRows?: number;
  /** Row id that is currently expanded, and what to render beneath it. */
  expandedId?: string | null;
  renderExpanded?: (row: T) => React.ReactNode;
}

function SkeletonRow({ columns }: { columns: Pick<Column<unknown>, "key" | "className" | "hideOnMobile">[] }) {
  return (
    <TableRow>
      {columns.map((col) => (
        <TableCell key={col.key} className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}>
          <Skeleton className="h-4 w-[80%]" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<T extends { _id: string }>({
  columns,
  rows,
  loading,
  error,
  empty,
  onRetry,
  rowActions,
  actionsHeader = "Actions",
  skeletonRows = 5,
  expandedId,
  renderExpanded,
}: DataTableProps<T>) {
  const hasActions = !!rowActions;

  if (loading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}>
                  <Skeleton className="h-4 w-[60%]" />
                </TableHead>
              ))}
              {hasActions && <TableHead className="w-[140px] text-right"><Skeleton className="h-4 w-[80%]" /></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} columns={columns} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-destructive">Failed to load data</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        {onRetry && <button onClick={onRetry} className="text-primary underline">Retry</button>}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        {empty ?? <p className="text-muted-foreground">No data available</p>}
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}>
                {col.header}
              </TableHead>
            ))}
            {hasActions && <TableHead className="w-[140px] text-right">{actionsHeader}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <React.Fragment key={row._id}>
              <TableRow className="animate-in fade-in-0 duration-300">
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(col.className, col.hideOnMobile && "hidden md:table-cell")}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {hasActions && <TableCell className="text-right">{rowActions(row)}</TableCell>}
              </TableRow>
              {renderExpanded && expandedId === row._id && (
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="p-0">
                    <div className="animate-in fade-in-0 slide-in-from-top-1 duration-200">
                      {renderExpanded(row)}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function statusBadge(status: PatientStatus) {
  const variants: Record<PatientStatus, "success" | "warning" | "destructive" | "neutral"> = {
    admitted: "success",
    discharged: "neutral",
    critical: "destructive",
  };
  return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}
