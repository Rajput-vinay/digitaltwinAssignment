import { useState, type FormEvent } from "react";
import { ApiError } from "../api/userService";
import type { Role, Status, UserInput } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Errors = Partial<Record<keyof UserInput, string>>;

function validate(v: UserInput): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Name is required";
  if (!v.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(v.email.trim()))
    e.email = "Enter a valid email address";
  if (v.phone.trim() && !/^[+\d][\d\s\-()]{5,19}$/.test(v.phone.trim()))
    e.phone = "Enter a valid phone number";
  return e;
}

interface Props {
  initial?: UserInput;
  submitLabel: string;
  onSubmit: (v: UserInput) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  const [values, setValues] = useState<UserInput>(
    initial ?? {
      name: "",
      email: "",
      phone: "",
      role: "viewer",
      status: "active",
    },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof UserInput>(k: K, v: UserInput[K]) =>
    setValues((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSaving(true);
    setFormError(null);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors)
        setErrors(err.fieldErrors as Errors); // server-side validation
      setFormError(err instanceof Error ? err.message : "Could not save user");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <label>
        Name
        <input
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          autoFocus
          aria-invalid={!!errors.name}
        />
        {errors.name && <span className="err">{errors.name}</span>}
      </label>
      <label>
        Email
        <input
          type="email"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className="err">{errors.email}</span>}
      </label>
      <label>
        Phone <span className="muted small">(optional)</span>
        <input
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <span className="err">{errors.phone}</span>}
      </label>
      <div className="grid2">
        <label>
          Role
          <select
            value={values.role}
            onChange={(e) => set("role", e.target.value as Role)}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>
        <label>
          Status
          <select
            value={values.status}
            onChange={(e) => set("status", e.target.value as Status)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>
      {formError && (
        <p className="alert" role="alert">
          {formError}
        </p>
      )}
      <div className="row end">
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
