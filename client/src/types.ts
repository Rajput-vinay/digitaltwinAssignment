export type Role = "admin" | "editor" | "viewer";
export type Status = "active" | "inactive";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export type UserInput = Pick<
  User,
  "name" | "email" | "phone" | "role" | "status"
>;

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  addedThisWeek: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
