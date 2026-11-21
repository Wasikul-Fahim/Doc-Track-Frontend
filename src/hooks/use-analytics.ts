"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ApiEnvelope } from "@/lib/api";
import type { DashboardOverview } from "@/lib/types";

export function useDashboard() {
  return useQuery<ApiEnvelope<DashboardOverview>, Error>({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiFetch<DashboardOverview>("/analytics/overview"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
