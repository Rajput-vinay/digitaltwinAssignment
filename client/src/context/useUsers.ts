import { useContext } from "react";
import { UsersContext } from "./usersContextObject";

export const PAGE_SIZE = 10;

export function useUsers() {
  return useContext(UsersContext);
}
