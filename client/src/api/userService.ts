import type { Paginated, Stats, User, UserInput } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the API running?");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError(
      res.status,
      body.message ?? "Something went wrong",
      body.errors,
    );
  return body as T;
}

// The only place in the frontend that talks to the API.
export const userService = {
  list: ({ q = "", page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (q) params.set("q", q);
    return request<Paginated<User>>(`/users?${params}`);
  },
  stats: () => request<Stats>("/users/stats"),
  get: (id: string) => request<User>(`/users/${id}`),
  create: (data: UserInput) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UserInput) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    request<{ message: string }>(`/users/${id}`, { method: "DELETE" }),
};
