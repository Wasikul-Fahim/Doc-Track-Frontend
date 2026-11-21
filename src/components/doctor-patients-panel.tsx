"use client";

import * as React from "react";
import { Plus, Search, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PatientFormDialog } from "@/components/patient-form-dialog";
import { statusBadge } from "@/components/data-table";
import { useToast } from "@/components/ui/use-toast";
import { useDeletePatient, usePatients, useUpdatePatient } from "@/hooks/use-patients";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDate } from "@/lib/utils";
import type { Doctor, Patient } from "@/lib/types";

const LIST_LIMIT = 100;

function doctorIdOf(patient: Patient) {
  return typeof patient.doctorId === "string" ? patient.doctorId : patient.doctorId?._id;
}

export function DoctorPatientsPanel({ doctor }: { doctor: Doctor }) {
  const { toast } = useToast();
  const { data, isLoading, error } = usePatients({
    doctorId: doctor._id,
    limit: LIST_LIMIT,
    sort: "-admittedAt",
  });
  const patients = data?.data ?? [];
  const total = data?.meta?.total ?? patients.length;

  const [addOpen, setAddOpen] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [toDelete, setToDelete] = React.useState<Patient | null>(null);

  const { data: candidates, isFetching } = usePatients(
    { search: debouncedSearch || undefined, limit: 10, sort: "name" },
    assigning
  );
  const assignable = (candidates?.data ?? []).filter((p) => doctorIdOf(p) !== doctor._id);

  const updateMutation = useUpdatePatient();
  const deleteMutation = useDeletePatient();

  const assign = async (patient: Patient) => {
    try {
      await updateMutation.mutateAsync({ id: patient._id, data: { doctorId: doctor._id } });
      toast.success("Assigned", { description: `${patient.name} is now assigned to ${doctor.name}.` });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete._id);
      toast.success("Deleted", { description: "Patient has been removed." });
    } catch (err) {
      toast.error("Cannot delete", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
    setToDelete(null);
  };

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          Patients of {doctor.name}{" "}
          <span className="text-muted-foreground">({total})</span>
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAssigning((value) => !value)}
            aria-expanded={assigning}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign existing
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add new
          </Button>
        </div>
      </div>

      {assigning && (
        <div className="animate-in fade-in-0 slide-in-from-top-1 space-y-2 rounded-lg border bg-card p-3 duration-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patients by name, phone or condition..."
                className="pl-9"
                aria-label="Search patients to assign"
                autoFocus
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setAssigning(false);
                setSearch("");
              }}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {assignable.length === 0 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">
              {isFetching ? "Searching..." : "No other patients found"}
            </p>
          ) : (
            <ul className="divide-y">
              {assignable.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.condition} ·{" "}
                      {typeof p.doctorId === "string" ? "—" : p.doctorId?.name ?? "—"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => assign(p)}
                    disabled={updateMutation.isPending}
                  >
                    Assign
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">Failed to load patients: {error.message}</p>
      ) : patients.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No patients yet. Add a new one or assign an existing patient.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {patients.map((p) => (
            <li
              key={p._id}
              className="animate-in fade-in-0 flex items-center justify-between gap-3 px-3 py-2 duration-200"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.age} yrs · {p.gender} · {p.condition} · admitted {formatDate(p.admittedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(p.status)}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setToDelete(p)}
                  aria-label={`Delete ${p.name}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {total > patients.length && (
        <p className="text-xs text-muted-foreground">
          Showing the {patients.length} most recent patients. Use the Patients page to see all.
        </p>
      )}

      <PatientFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        fixedDoctor={{ _id: doctor._id, name: doctor.name }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title="Delete Patient"
        description={`Are you sure you want to delete ${toDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={remove}
      />
    </div>
  );
}
