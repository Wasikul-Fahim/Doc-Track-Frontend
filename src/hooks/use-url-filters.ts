"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilters = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      let pageReset = true;

      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key === "page") pageReset = false;
      }

      if (pageReset) next.delete("page");

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(
    (keep?: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      const keysToRemove: string[] = [];
      for (const key of next.keys()) {
        if (!keep?.includes(key)) keysToRemove.push(key);
      }
      for (const key of keysToRemove) next.delete(key);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { params: searchParams, setFilters, clearFilters };
}
