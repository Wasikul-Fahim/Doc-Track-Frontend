"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toQueryString, type ApiEnvelope } from "@/lib/api";
import type { Patient, PaginationMeta } from "@/lib/types";

interface PatientListResponse {
  data: Patient[];
  meta: PaginationMeta;
}

export function usePatients(
  params: Record<string, string | number | undefined>,
  enabled = true
) {
  const qs = toQueryString(params);
  return useQuery<ApiEnvelope<Patient[]>, Error>({
    queryKey: ["patients", params],
    queryFn: () => apiFetch<Patient[]>(`/patients${qs}`),
    enabled,
    placeholderData: (prev: ApiEnvelope<Patient[]> | undefined) => prev,
  });
}

export function usePatient(id: string, enabled = true) {
  return useQuery<ApiEnvelope<Patient>, Error>({
    queryKey: ["patients", id],
    queryFn: () => apiFetch<Patient>(`/patients/${id}`),
    enabled: enabled && id.length > 0,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Patient>) =>
      apiFetch<Patient>("/patients", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) =>
      apiFetch<Patient>(`/patients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients", id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/patients/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export { useDoctorOptions } from "./use-doctors";
export { PATIENT_STATUSES, GENDERS } from "@/lib/types";
