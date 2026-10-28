import { useState } from "react";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import UserDetails from "../components/UserDetails";
import Pagination from "../components/Pagination";
import { PAGE_SIZE, useUsers } from "../context/useUsers";
import type { User } from "../types";

type Dialog =
  | { kind: "create" }
  | { kind: "view"; user: User }
  | { kind: "edit"; user: User }
  | { kind: "delete"; user: User }
  | null;

export default function Users() {
  const {
    users,
    loading,
    error,
    search,
    setSearch,
    meta,
    setPage,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const close = () => {
    setDialog(null);
    setDeleteError(null);
  };

  async function confirmDelete(u: User) {
    setDeleting(true);
    try {
      await deleteUser(u._id);
      close();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Could not delete user");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="row between wrap">
        <h1>Users</h1>
        <div className="row">
          <input
            className="search"
            type="search"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
          <button className="btn" onClick={() => setDialog({ kind: "create" })}>
            Add user
          </button>
        </div>
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {loading && !users.length ? (
        <p className="muted">Loading…</p>
      ) : users.length === 0 ? (
        <p className="empty">
          {search
            ? `No users match “${search}”.`
            : "No users yet. Add your first user to get started."}
        </p>
      ) : (
        <div className="card tablewrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>
                  <span className="sr">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "–"}</td>
                  <td className="cap">{u.role}</td>
                  <td>
                    <span className={`badge ${u.status}`}>{u.status}</span>
                  </td>
                  <td className="actions">
                    <button
                      className="link"
                      onClick={() => setDialog({ kind: "view", user: u })}
                    >
                      View
                    </button>
                    <button
                      className="link"
                      onClick={() => setDialog({ kind: "edit", user: u })}
                    >
                      Edit
                    </button>
                    <button
                      className="link danger"
                      onClick={() => setDialog({ kind: "delete", user: u })}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      {dialog?.kind === "create" && (
        <Modal title="Add user" onClose={close}>
          <UserForm
            submitLabel="Add user"
            onCancel={close}
            onSubmit={async (v) => {
              await createUser(v);
              close();
            }}
          />
        </Modal>
      )}
      {dialog?.kind === "edit" && (
        <Modal title="Edit user" onClose={close}>
          <UserForm
            submitLabel="Save changes"
            initial={dialog.user}
            onCancel={close}
            onSubmit={async (v) => {
              await updateUser(dialog.user._id, v);
              close();
            }}
          />
        </Modal>
      )}
      {dialog?.kind === "view" && (
        <Modal title="User details" onClose={close}>
          <UserDetails id={dialog.user._id} onClose={close} />
        </Modal>
      )}
      {dialog?.kind === "delete" && (
        <Modal title="Delete user?" onClose={close}>
          <p>
            This permanently removes <strong>{dialog.user.name}</strong> (
            {dialog.user.email}). This can’t be undone.
          </p>
          {deleteError && (
            <p className="alert" role="alert">
              {deleteError}
            </p>
          )}
          <div className="row end">
            <button className="btn ghost" onClick={close}>
              Keep user
            </button>
            <button
              className="btn danger-solid"
              disabled={deleting}
              onClick={() => confirmDelete(dialog.user)}
            >
              {deleting ? "Deleting…" : "Delete user"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
