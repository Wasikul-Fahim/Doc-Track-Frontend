"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  children?: React.ReactNode;
  searchPlaceholder?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  hasActiveFilters,
  onClearFilters,
  children,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search"
          />
        </div>
        {hasActiveFilters && onClearFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </form>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
