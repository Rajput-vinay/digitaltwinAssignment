import { useState, type FormEvent } from "react";
import { ApiError } from "../api/userService";
import type { Role, Status, UserInput } from "../types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Errors = Partial<Record<keyof UserInput, string>>;

// Check the form values before sending them to the backend.
function validate(values: UserInput): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (
    values.phone.trim() &&
    !/^[+\d][\d\s\-()]{5,19}$/.test(values.phone.trim())
  ) {
    errors.phone = "Enter a valid phone number";
  }

  return errors;
}

interface Props {
  initial?: UserInput;
  submitLabel: string;
  onSubmit: (values: UserInput) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: Props) {
  // Use the supplied user values when editing; otherwise start with empty fields.
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

  // Update one field without changing the other form values.
  const updateField = <K extends keyof UserInput>(
    fieldName: K,
    fieldValue: UserInput[K],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: fieldValue,
    }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    // Stop here and show messages if any field is invalid.
    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      // Remove extra spaces before sending the data to the server.
      await onSubmit({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
    } catch (error) {
      // Show field-specific errors returned by the backend.
      if (error instanceof ApiError && error.fieldErrors) {
        setErrors(error.fieldErrors as Errors);
      }

      setFormError(
        error instanceof Error ? error.message : "Could not save user",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <label>
        Name
        <input
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
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
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={!!errors.email}
        />
        {errors.email && <span className="err">{errors.email}</span>}
      </label>

      <label>
        Phone <span className="muted small">(optional)</span>
        <input
          value={values.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <span className="err">{errors.phone}</span>}
      </label>

      <div className="grid2">
        <label>
          Role
          <select
            value={values.role}
            onChange={(event) =>
              updateField("role", event.target.value as Role)
            }
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
            onChange={(event) =>
              updateField("status", event.target.value as Status)
            }
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
