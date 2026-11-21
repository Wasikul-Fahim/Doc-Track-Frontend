"use client";

import * as React from "react";
import { Plus, Filter, MoreVertical, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePatients, useDeletePatient } from "@/hooks/use-patients";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { DataTable, statusBadge } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { PatientFormDialog } from "@/components/patient-form-dialog";
import { FilterBar } from "@/components/filter-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import {
  GENDERS,
  STATUS_ENUM,
  type Patient,
  type Gender,
  type PatientStatus,
} from "@/lib/types";

export default function PatientsPage() {
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [doctorFilter, setDoctorFilter] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sort, setSort] = React.useState("-admittedAt");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      gender: gender || undefined,
      status: status || undefined,
      doctorId: doctorFilter || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: sort || "-admittedAt",
    }),
    [page, limit, debouncedSearch, gender, status, doctorFilter, fromDate, toDate, sort]
  );

  const { data, isLoading, error, refetch } = usePatients(queryParams);
  const { data: doctorOptions } = useDoctorOptions();
  const doctors = doctorOptions?.data ?? [];

  const deleteMutation = useDeletePatient();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPatient, setEditingPatient] = React.useState<Patient | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasActiveFilters = Boolean(
    search || gender || status || doctorFilter || fromDate || toDate || sort !== "-admittedAt"
  );

  const openCreate = () => {
    setEditingPatient(null);
    setDialogOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      toast.success("Deleted", { description: "Patient has been removed." });
    } catch (err) {
      toast.error("Cannot delete", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
    setDeleteConfirm(null);
  };

  const columns = React.useMemo(
    () => [
      {
        key: "patient",
        header: "Patient",
        cell: (row: Patient) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.phone}</p>
          </div>
        ),
      },
      {
        key: "age",
        header: "Age",
        cell: (row: Patient) => <span className="font-mono text-sm">{row.age}</span>,
      },
      {
        key: "gender",
        header: "Gender",
        cell: (row: Patient) => <Badge variant="secondary">{row.gender}</Badge>,
      },
      {
        key: "condition",
        header: "Condition",
        cell: (row: Patient) => (
          <span className="text-sm text-muted-foreground">{row.condition}</span>
        ),
      },
      {
        key: "doctor",
        header: "Doctor",
        cell: (row: Patient) => (
          <span className="text-sm">
            {typeof row.doctorId === "string"
              ? "—"
              : row.doctorId?.name ?? "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row: Patient) => statusBadge(row.status),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage patients with filters and search.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => setPage(1)}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search patients..."
        onClearFilters={() => {
          setSearch("");
          setDebouncedSearch("");
          setGender("");
          setStatus("");
          setDoctorFilter("");
          setFromDate("");
          setToDate("");
          setSort("-admittedAt");
          setPage(1);
        }}
      >
        <Select
          value={gender || "all"}
          onValueChange={(value) => {
            setGender(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All genders</SelectItem>
            {GENDERS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status || "all"}
          onValueChange={(value) => {
            setStatus(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_ENUM.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={doctorFilter || "all"}
          onValueChange={(value) => {
            setDoctorFilter(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All doctors</SelectItem>
            {doctors.map((d) => (
              <SelectItem key={d._id} value={d._id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-[150px]"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="w-[150px]"
            aria-label="To date"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-admittedAt">Newest</SelectItem>
            <SelectItem value="admittedAt">Oldest</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="-name">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        empty={
          <div className="py-8 text-center">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No patients found</p>
          </div>
        }
        rowActions={(row: Patient) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(row)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteConfirm({ id: row._id, name: row.name })}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pageSize={limit}
          total={data.meta.total}
          totalPages={data.meta.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setLimit(size);
            setPage(1);
          }}
        />
      )}

      <PatientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        patient={editingPatient}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
        title="Delete Patient"
        description={`Are you sure you want to delete ${deleteConfirm?.name}?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={executeDelete}
      />
    </div>
  );
}
