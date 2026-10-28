import { Link } from "react-router-dom";
import { useUsers } from "../context/useUsers";

export default function Dashboard() {
  const { stats, loading, error } = useUsers();
  if (loading && !stats) return <p className="muted">Loading…</p>;
  if (error && !stats)
    return (
      <p className="alert" role="alert">
        {error}
      </p>
    );
  if (!stats) return null;

  const activePct = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;
  return (
    <>
      <h1>Dashboard</h1>
      <section className="card hero">
        <div>
          <p className="muted">Registered users</p>
          <p className="big" aria-live="polite">
            {stats.total}
          </p>
        </div>
        <Link to="/users" className="btn">
          Manage users
        </Link>
      </section>

      {stats.total === 0 ? (
        <p className="empty">
          No users yet. Add the first one from the Users page.
        </p>
      ) : (
        <section className="stats">
          <div className="card">
            <p className="muted">Added this week</p>
            <p className="num">{stats.addedThisWeek}</p>
          </div>
          <div className="card">
            <p className="muted">Active</p>
            <p className="num">{stats.active}</p>
          </div>
          <div className="card">
            <p className="muted">Inactive</p>
            <p className="num">{stats.inactive}</p>
          </div>
          <div className="card wide">
            <p className="muted">{activePct}% of users are active</p>
            <div className="bar" role="img" aria-label={`${activePct}% active`}>
              <span style={{ width: `${activePct}%` }} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
