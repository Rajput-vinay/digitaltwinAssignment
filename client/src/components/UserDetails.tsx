import { useEffect, useState } from "react";
import { userService } from "../api/userService";
import type { User } from "../types";

// Fetches the single user via GET /users/:id so "Read" really goes through the API
export default function UserDetails({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .get(id)
      .then(setUser)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <>
        <p className="alert">{error}</p>
        <div className="row end">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </>
    );
  if (!user) return <p className="muted">Loading…</p>;

  const rows: [string, string][] = [
    ["Name", user.name],
    ["Email", user.email],
    ["Phone", user.phone || "Not provided"],
    ["Role", user.role],
    ["Status", user.status],
    ["Created", new Date(user.createdAt).toLocaleString()],
    ["Updated", new Date(user.updatedAt).toLocaleString()],
  ];
  return (
    <>
      <dl className="details">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="row end">
        <button className="btn" onClick={onClose}>
          Close
        </button>
      </div>
    </>
  );
}
