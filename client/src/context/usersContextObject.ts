import { createContext } from "react";
import type { Stats, User, UserInput } from "../types";

interface PageMeta {
  page: number;
  totalPages: number;
  total: number;
}

export interface UsersState {
  users: User[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (q: string) => void;
  meta: PageMeta;
  setPage: (p: number) => void;
  refresh: () => Promise<void>;
  createUser: (data: UserInput) => Promise<void>;
  updateUser: (id: string, data: UserInput) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const noop = () => Promise.resolve();
const noopSync = () => {};

export const UsersContext = createContext<UsersState>({
  users: [],
  stats: null,
  loading: true,
  error: null,
  search: "",
  setSearch: noopSync,
  meta: { page: 1, totalPages: 1, total: 0 },
  setPage: noopSync,
  refresh: noop,
  createUser: noop,
  updateUser: noop,
  deleteUser: noop,
});
