import type { ApiEnvelope, ApiErrorPayload } from "./types";

export type { ApiEnvelope };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: ApiErrorPayload["details"];

  constructor(
    message: string,
    status: number,
    code = "UNKNOWN",
    details?: ApiErrorPayload["details"]
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  fieldErrors(): Record<string, string> {
    if (!Array.isArray(this.details)) return {};
    return Object.fromEntries(
      this.details
        .filter((detail) => typeof detail?.field === "string")
        .map((detail) => [detail.field, detail.message])
    );
  }
}

export function toQueryString(params: Record<string, unknown>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => null)) as
    | ApiEnvelope<T>
    | { success: false; error: ApiErrorPayload }
    | null;

  if (!res.ok || !body || body.success === false) {
    if (res.status === 401 && !path.startsWith("/auth/login")) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    const error = body && body.success === false ? body.error : undefined;
    throw new ApiError(
      error?.message ?? "Something went wrong. Please try again.",
      res.status,
      error?.code,
      error?.details
    );
  }

  return body;
}
