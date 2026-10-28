import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { userService } from "../api/userService";
import type { Stats, User, UserInput } from "../types";
import { UsersContext, type UsersState } from "./usersContextObject";

const POLL_MS = 15000;
const PAGE_SIZE = 10;

interface PageMeta {
  page: number;
  totalPages: number;
  total: number;
}

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PageMeta>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const setSearch = useCallback((q: string) => {
    setSearchState(q);
    setPage(1);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [res, s] = await Promise.all([
        userService.list({ q: search.trim(), page, limit: PAGE_SIZE }),
        userService.stats(),
      ]);
      setUsers(res.data);
      setMeta({ page: res.page, totalPages: res.totalPages, total: res.total });
      if (res.page !== page) setPage(res.page); // server clamped (e.g. last item on the page was deleted)
      setStats(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Debounced fetch on search/page change, plus light polling so the dashboard stays live across tabs.
  useEffect(() => {
    const t = setTimeout(refresh, 250);
    const poll = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(t);
      clearInterval(poll);
    };
  }, [refresh]);

  const value = useMemo<UsersState>(
    () => ({
      users,
      stats,
      loading,
      error,
      search,
      setSearch,
      meta,
      setPage,
      refresh,
      createUser: async (d: UserInput) => {
        await userService.create(d);
        await refresh();
      },
      updateUser: async (id: string, d: UserInput) => {
        await userService.update(id, d);
        await refresh();
      },
      deleteUser: async (id: string) => {
        await userService.remove(id);
        await refresh();
      },
    }),
    [users, stats, loading, error, search, setSearch, meta, refresh],
  );

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}
