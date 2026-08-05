import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth/useAuth";
import { getHomeRoute } from "../features/auth/utils/getHomeRoute";
import { ApiError } from "../services/errors";

interface FormState {
  email: string;
  password: string;
}

type FormField = keyof FormState;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState) {
  const errors: Partial<Record<FormField, string>> = {};

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<FormField, boolean>>({
    email: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  function updateField(field: FormField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field: FormField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const loggedInUser = await login(form.email.trim(), form.password);
      navigate(getHomeRoute(loggedInUser.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthError("Invalid email or password.");
      } else {
        setAuthError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Deskline</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Sign in to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          {authError && (
            <p
              role="alert"
              className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {authError}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              onBlur={() => markTouched("email")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              onBlur={() => markTouched("password")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="info"
            className="w-full"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
          <p className="font-medium text-[var(--color-text)]">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>Requester: john.doe@example.com</li>
            <li>Technician: jane.smith@example.com</li>
            <li>Admin: bob.johnson@example.com</li>
          </ul>
          <p className="mt-2">Password: password123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
