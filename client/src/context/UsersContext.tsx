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

// This component stores the users data and makes it available to the app.
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

  // When search text changes, start from the first page.
  const setSearch = useCallback((searchText: string) => {
    setSearchState(searchText);
    setPage(1);
  }, []);

  // Load the current page of users and the dashboard statistics.
  const refresh = useCallback(async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        userService.list({
          q: search.trim(),
          page,
          limit: PAGE_SIZE,
        }),
        userService.stats(),
      ]);

      setUsers(usersResponse.data);
      setMeta({
        page: usersResponse.page,
        totalPages: usersResponse.totalPages,
        total: usersResponse.total,
      });

      // The backend may change the page number if the last user was deleted.
      if (usersResponse.page !== page) {
        setPage(usersResponse.page);
      }

      setStats(statsResponse);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  // Refresh after search/page changes and poll every 15 seconds.
  useEffect(() => {
    const timeoutId = setTimeout(refresh, 250);
    const intervalId = setInterval(refresh, POLL_MS);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [refresh]);

  // Share the data and actions with every component using UsersContext.
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

      // Create a user, then reload the list.
      createUser: async (data: UserInput) => {
        await userService.create(data);
        await refresh();
      },

      // Update a user, then reload the list.
      updateUser: async (id: string, data: UserInput) => {
        await userService.update(id, data);
        await refresh();
      },

      // Delete a user, then reload the list.
      deleteUser: async (id: string) => {
        await userService.remove(id);
        await refresh();
      },
    }),
    [users, stats, loading, error, search, setSearch, meta, refresh],
  );

  return (
    <UsersContext.Provider value={value}>
      {children}
    </UsersContext.Provider>
  );
}
