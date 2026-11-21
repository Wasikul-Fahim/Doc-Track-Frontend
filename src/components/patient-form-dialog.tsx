"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients";
import { useDoctorOptions } from "@/hooks/use-doctors";
import { useToast } from "@/components/ui/use-toast";
import { GENDERS, STATUS_ENUM, type Patient } from "@/lib/types";

const patientSchema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  age: z.number().int().min(0, "Age is required").max(150),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Choose a gender" }) }),
  phone: z.string().min(6, "Phone number is too short").max(30),
  condition: z.string().min(2, "Condition is too short").max(100),
  status: z.enum(STATUS_ENUM, { errorMap: () => ({ message: "Choose a status" }) }),
  doctorId: z.string().min(1, "Choose a doctor"),
});

type PatientForm = z.infer<typeof patientSchema>;

const emptyValues: PatientForm = {
  name: "",
  age: 0,
  gender: GENDERS[0],
  phone: "",
  condition: "",
  status: STATUS_ENUM[0],
  doctorId: "",
};

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a patient to edit it; leave empty to create one. */
  patient?: Patient | null;
  /** Lock the doctor (used when adding a patient from a doctor's row). */
  fixedDoctor?: { _id: string; name: string } | null;
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  fixedDoctor,
}: PatientFormDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const { data: doctorOptions } = useDoctorOptions();
  const doctors = doctorOptions?.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const form = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    if (patient) {
      form.reset({
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        condition: patient.condition,
        status: patient.status,
        doctorId:
          typeof patient.doctorId === "string" ? patient.doctorId : patient.doctorId?._id ?? "",
      });
    } else {
      form.reset({ ...emptyValues, doctorId: fixedDoctor?._id ?? "" });
    }
  }, [open, patient, fixedDoctor?._id, form]);

  const handleSubmit = async (values: PatientForm) => {
    try {
      if (patient) {
        await updateMutation.mutateAsync({ id: patient._id, data: values });
        toast.success("Updated", { description: "Patient has been updated." });
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Created", { description: "Patient has been added." });
      }
      onOpenChange(false);
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{patient ? "Edit Patient" : "Add Patient"}</DialogTitle>
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
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={Number.isNaN(field.value) ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? 0 : e.target.valueAsNumber)
                      }
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.age?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value as string} disabled={isSaving}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.gender?.message}</FormMessage>
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
                    <Input placeholder="+880 1712 345678" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter condition" {...field} disabled={isSaving} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.condition?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value as string} disabled={isSaving}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_ENUM.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage>{form.formState.errors.status?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <FormControl>
                    {fixedDoctor ? (
                      <Input value={fixedDoctor.name} disabled readOnly />
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value as string} disabled={isSaving}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d._id} value={d._id}>
                              {d.name} · {d.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage>{form.formState.errors.doctorId?.message}</FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
  );
}
