import type { Paginated, Stats, User, UserInput } from "../types";

// Base URL of the backend API. In development, this is usually /api.
const BASE = import.meta.env.VITE_API_URL ?? "/api";

// A custom error class so the UI can read the HTTP status and field errors.
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

// Send a request to the backend and return the response data.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the API running?");
  }

  // Read the JSON response. Use an empty object if the response has no JSON.
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.message ?? "Something went wrong",
      body.errors,
    );
  }

  return body as T;
}

// Keep all API calls in this one place.
export const userService = {
  // Get users for the selected page and optional search term.
  list: ({ q = "", page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (q) params.set("q", q);

    return request<Paginated<User>>(`/users?${params}`);
  },

  // Get the totals shown on the dashboard.
  stats: () => request<Stats>("/users/stats"),

  // Get one user by ID.
  get: (id: string) => request<User>(`/users/${id}`),

  // Create a new user.
  create: (data: UserInput) =>
    request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Save changes to an existing user.
  update: (id: string, data: UserInput) =>
    request<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete a user by ID.
  remove: (id: string) =>
    request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),
};
