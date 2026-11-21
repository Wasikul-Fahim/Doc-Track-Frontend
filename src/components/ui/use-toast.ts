"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
  function toast(message: string, options?: { description?: string }) {
    return sonnerToast(message, options);
  }
  toast.success = (message: string, options?: { description?: string }) => sonnerToast.success(message, options);
  toast.error = (message: string, options?: { description?: string }) => sonnerToast.error(message, options);
  toast.loading = (message: string, options?: { description?: string }) => sonnerToast.loading(message, options);
  toast.dismiss = (id?: string | number) => sonnerToast.dismiss(id);
  return { toast };
}
