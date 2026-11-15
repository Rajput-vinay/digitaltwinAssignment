import { useState } from "react";
import Modal from "../components/Modal";
import UserForm from "../components/UserForm";
import UserDetails from "../components/UserDetails";
import Pagination from "../components/Pagination";
import { PAGE_SIZE, useUsers } from "../context/useUsers";
import type { User } from "../types";

// The dialog state tells the page which popup should be displayed.
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

  // Close the popup and clear any previous delete error.
  const close = () => {
    setDialog(null);
    setDeleteError(null);
  };

  // Delete the selected user after the user confirms the action.
  async function confirmDelete(user: User) {
    setDeleting(true);

    try {
      await deleteUser(user._id);
      close();
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete user",
      );
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
            onChange={(event) => setSearch(event.target.value)}
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
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || "–"}</td>
                  <td className="cap">{user.role}</td>
                  <td>
                    <span className={`badge ${user.status}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="link"
                      onClick={() => setDialog({ kind: "view", user })}
                    >
                      View
                    </button>

                    <button
                      className="link"
                      onClick={() => setDialog({ kind: "edit", user })}
                    >
                      Edit
                    </button>

                    <button
                      className="link danger"
                      onClick={() => setDialog({ kind: "delete", user })}
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

      {/* Create a new user. */}
      {dialog?.kind === "create" && (
        <Modal title="Add user" onClose={close}>
          <UserForm
            submitLabel="Add user"
            onCancel={close}
            onSubmit={async (values) => {
              await createUser(values);
              close();
            }}
          />
        </Modal>
      )}

      {/* Edit the selected user. */}
      {dialog?.kind === "edit" && (
        <Modal title="Edit user" onClose={close}>
          <UserForm
            submitLabel="Save changes"
            initial={dialog.user}
            onCancel={close}
            onSubmit={async (values) => {
              await updateUser(dialog.user._id, values);
              close();
            }}
          />
        </Modal>
      )}

      {/* Show the selected user's details. */}
      {dialog?.kind === "view" && (
        <Modal title="User details" onClose={close}>
          <UserDetails id={dialog.user._id} onClose={close} />
        </Modal>
      )}

      {/* Ask for confirmation before deleting a user. */}
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
