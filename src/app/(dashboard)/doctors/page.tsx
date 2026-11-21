"use client";

import * as React from "react";
import { Plus, Filter, MoreVertical, Edit, Trash2, Loader2, ChevronDown } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useDoctors,
  useCreateDoctor,
  useUpdateDoctor,
  useDeleteDoctor,
} from "@/hooks/use-doctors";
import { DataTable } from "@/components/data-table";
import { Pagination } from "@/components/pagination";
import { FilterBar } from "@/components/filter-bar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/components/ui/utils";
import { SPECIALIZATIONS, type Doctor, type Specialization } from "@/lib/types";
import { SpecializationHint } from "@/components/specialization-hint";
import { DoctorPatientsPanel } from "@/components/doctor-patients-panel";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  formatPhoneDisplay,
  formatPhoneInput,
  isValidPhone,
  normalizePhone,
  toInternationalPhone,
} from "@/lib/phone";

const doctorSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  specialization: z.enum(SPECIALIZATIONS, {
    errorMap: () => ({ message: "Choose a specialization" }),
  }),
  hospital: z.string().min(2, "Hospital is required").max(150),
  area: z.string().min(2, "Hospital location is required").max(100),
  phone: z
    .string()
    .refine(isValidPhone, "Enter a valid mobile number (01XXX-XXXXXX)"),
  email: z.string().email("Enter a valid email address"),
});

type DoctorForm = z.infer<typeof doctorSchema>;

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "createdAt", label: "Oldest" },
  { value: "name", label: "Name (A-Z)" },
  { value: "-name", label: "Name (Z-A)" },
  { value: "specialization", label: "Specialization" },
  { value: "area", label: "Location" },
] as const;

export default function DoctorsPage() {
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [specialization, setSpecialization] = React.useState("");
  const [area, setArea] = React.useState("");
  const [hospitalFilter, setHospitalFilter] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [sort, setSort] = React.useState("-createdAt");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const debouncedArea = useDebouncedValue(area);
  const debouncedHospital = useDebouncedValue(hospitalFilter);

  const queryParams = React.useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      specialization: specialization || undefined,
      area: debouncedArea || undefined,
      hospital: debouncedHospital || undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
      sort: sort || "-createdAt",
    }),
    [page, limit, debouncedSearch, specialization, debouncedArea, debouncedHospital, fromDate, toDate, sort]
  );

  const { data, isLoading, error, refetch } = useDoctors(queryParams);
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const deleteMutation = useDeleteDoctor();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingDoctor, setEditingDoctor] = React.useState<{ _id: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string } | null>(null);

  const form = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialization: SPECIALIZATIONS[0],
      hospital: "",
      area: "",
      phone: "",
      email: "",
    },
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasActiveFilters = Boolean(
    search || specialization || area || hospitalFilter || fromDate || toDate || sort !== "-createdAt"
  );
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: DoctorForm) => {
    try {
      if (editingDoctor) {
        await updateMutation.mutateAsync({
          id: editingDoctor._id,
          data: { ...values, phone: normalizePhone(values.phone) },
        });
        toast.success("Updated", { description: "Doctor has been updated." });
      } else {
        await createMutation.mutateAsync({ ...values, phone: normalizePhone(values.phone) });
        toast.success("Created", { description: "Doctor has been added." });
      }
      setDialogOpen(false);
      setEditingDoctor(null);
      form.reset();
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const openCreate = () => {
    setEditingDoctor(null);
    form.reset({
      name: "",
      specialization: SPECIALIZATIONS[0],
      hospital: "",
      area: "",
      phone: "",
      email: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditingDoctor({ _id: doc._id });
    form.reset({
      name: doc.name,
      specialization: doc.specialization as Specialization,
      hospital: doc.hospital,
      area: doc.area,
      phone: formatPhoneDisplay(doc.phone),
      email: doc.email,
    });
    setDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id);
      toast.success("Deleted", { description: "Doctor has been removed." });
    } catch (err) {
      toast.error("Cannot delete", {
        description:
          err instanceof Error ? err.message : "This doctor has patients assigned.",
      });
    }
    setDeleteConfirm(null);
  };

  const copyPhone = React.useCallback(
    async (phone: string) => {
      const international = toInternationalPhone(phone);
      if (!international) {
        toast.error("Cannot copy", { description: "This phone number is not in a valid format." });
        return;
      }
      try {
        await navigator.clipboard.writeText(international);
        toast.success("Copied", { description: international });
      } catch {
        toast.error("Cannot copy", { description: "Clipboard access was blocked." });
      }
    },
    [toast]
  );

  const columns = React.useMemo(
    () => [
      {
        key: "doctor",
        header: "Doctor",
        cell: (row: Doctor) => (
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-sm text-muted-foreground">{row.email}</p>
          </div>
        ),
      },
      {
        key: "specialization",
        header: "Specialization",
        cell: (row: Doctor) => (
          <SpecializationHint specialization={row.specialization}>
            <span className="inline-flex cursor-help">
              <Badge variant="secondary">{row.specialization}</Badge>
            </span>
          </SpecializationHint>
        ),
      },
      {
        key: "hospital",
        header: "Hospital",
        cell: (row: Doctor) => <span className="text-sm">{row.hospital}</span>,
      },
      {
        key: "area",
        header: "Location",
        cell: (row: Doctor) => (
          <span className="text-sm">{row.area || "—"}</span>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        cell: (row: Doctor) =>
          row.phone ? (
            <button
              type="button"
              onClick={() => copyPhone(row.phone)}
              title="Click to copy"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              {formatPhoneDisplay(row.phone)}
            </button>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        key: "patients",
        header: "Patients",
        cell: (row: Doctor) => {
          const expanded = expandedId === row._id;
          return (
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : row._id)}
              aria-expanded={expanded}
              aria-label={`${expanded ? "Hide" : "Show"} patients of ${row.name}`}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-accent"
            >
              <span
                className={cn(
                  "font-mono text-sm",
                  row.patientCount > 0 ? "text-primary" : "text-muted-foreground"
                )}
              >
                {row.patientCount}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
            </button>
          );
        },
      },
    ],
    [copyPhone, expandedId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Manage doctors and view their patient counts.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => setPage(1)}
        hasActiveFilters={hasActiveFilters}
        searchPlaceholder="Search doctors..."
        onClearFilters={() => {
          setSearch("");
          setDebouncedSearch("");
          setSpecialization("");
          setArea("");
          setHospitalFilter("");
          setFromDate("");
          setToDate("");
          setSort("-createdAt");
          setPage(1);
        }}
      >
        <Select
          value={specialization || "all"}
          onValueChange={(value) => {
            setSpecialization(value === "all" ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {SPECIALIZATIONS.map((s) => (
              <SpecializationHint key={s} specialization={s}>
                <SelectItem value={s}>{s}</SelectItem>
              </SpecializationHint>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setPage(1);
          }}
          placeholder="Location"
          className="w-[170px]"
          aria-label="Filter by location"
        />
        <Input
          value={hospitalFilter}
          onChange={(e) => {
            setHospitalFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Hospital"
          className="w-[170px]"
          aria-label="Filter by hospital"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-[150px]"
            aria-label="Added from"
            title="Added from"
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
            aria-label="Added to"
            title="Added to"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) => {
            setSort(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        expandedId={expandedId}
        renderExpanded={(row: Doctor) => <DoctorPatientsPanel doctor={row} />}
        empty={
          <div className="py-8 text-center">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No doctors found</p>
          </div>
        }
        rowActions={(row: Doctor) => (
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Hasan Fahim" {...field} disabled={isSaving} />
                    </FormControl>
                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALIZATIONS.map((s) => (
                            <SpecializationHint key={s} specialization={s}>
                              <SelectItem value={s}>{s}</SelectItem>
                            </SpecializationHint>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.specialization?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City General Hospital"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.hospital?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dhanmondi, Dhaka"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.area?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="01712-345678"
                        {...field}
                        onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@clinic.com"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={executeDelete}
      />
    </div>
  );
}
