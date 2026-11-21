"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, toQueryString, type ApiEnvelope } from "@/lib/api";
import type { Doctor, DoctorOption, PaginationMeta } from "@/lib/types";

interface DoctorListResponse {
  data: Doctor[];
  meta: PaginationMeta;
}

export function useDoctors(params: Record<string, string | number | undefined>) {
  const qs = toQueryString(params);
  return useQuery<ApiEnvelope<Doctor[]>, Error>({
    queryKey: ["doctors", params],
    queryFn: () => apiFetch<Doctor[]>(`/doctors${qs}`),
    placeholderData: (prev: ApiEnvelope<Doctor[]> | undefined) => prev,
  });
}

export function useDoctor(id: string, enabled = true) {
  return useQuery<ApiEnvelope<Doctor>, Error>({
    queryKey: ["doctors", id],
    queryFn: () => apiFetch<Doctor>(`/doctors/${id}`),
    enabled: enabled && id.length > 0,
  });
}

export function useDoctorOptions() {
  return useQuery<ApiEnvelope<DoctorOption[]>, Error>({
    queryKey: ["doctors", "options"],
    queryFn: () => apiFetch<DoctorOption[]>("/doctors/options"),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Doctor>) =>
      apiFetch<Doctor>("/doctors", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", "options"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Doctor> }) =>
      apiFetch<Doctor>(`/doctors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", id] });
      queryClient.invalidateQueries({ queryKey: ["doctors", "options"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ id: string }>(`/doctors/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctors", "options"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
