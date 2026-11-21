"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading, error } = useMe();
  const user = data?.data?.user;

  React.useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.replace("/login");
    }
  }, [isLoading, error, user, router]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-32 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return <>{children}</>;
}
