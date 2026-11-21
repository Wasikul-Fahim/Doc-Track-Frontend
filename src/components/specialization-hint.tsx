"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SPECIALIZATION_INFO } from "@/lib/specializations";
import type { Specialization } from "@/lib/types";

/** Wraps a single element and explains the specialization on hover/focus. */
export function SpecializationHint({
  specialization,
  children,
}: {
  specialization: string;
  children: React.ReactElement;
}) {
  const info = SPECIALIZATION_INFO[specialization as Specialization];
  if (!info) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        {info}
      </TooltipContent>
    </Tooltip>
  );
}
