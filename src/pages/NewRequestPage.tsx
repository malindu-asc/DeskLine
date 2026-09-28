import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import AppLayout from "../layouts/AppLayout";
import { Button } from "../components/ui/Button";
import { requestService } from "../services/requestService";
import { messageService } from "../services/messageService";
import { ApiError } from "../services/errors";
import { useAuth } from "../features/auth/useAuth";
import type { RequestCategory, RequestPriority } from "../shared/types";

interface FormState {
  title: string;
  description: string;
  category: string;
  priority: string;
}

type FormField = keyof FormState;

const initialForm: FormState = {
  title: "",
  description: "",
  category: "",
  priority: "",
};

function validate(form: FormState) {
  const errors: Partial<Record<FormField, string>> = {};

  if (form.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  if (form.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  if (!form.category) {
    errors.category = "Please select a category.";
  }

  if (!form.priority) {
    errors.priority = "Please select a priority.";
  }

  return errors;
}

function NewRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Record<FormField, boolean>>({
    title: false,
    description: false,
    category: false,
    priority: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setTouched({ title: true, description: true, category: true, priority: true });

    if (!isValid || isSubmitting || !user) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const timestamp = new Date().toISOString();

    const newRequest = {
    id: crypto.randomUUID(),
    title: form.title.trim(),
    status: "open" as const,
    category: form.category as RequestCategory,
    priority: form.priority as RequestPriority,
    requesterId: user.id,
    assigneeId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
   };

    try {
     const created = await requestService.create(newRequest);

     await messageService.create({
       id: crypto.randomUUID(),
       requestId: created.id,
       authorId: user.id,
       body: form.description.trim(),
       createdAt: timestamp,
     });

     navigate("/my-requests");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setSubmitError("You don't have permission to create a request.");
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
      console.error("Failed to create request:", error);
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <section className="mx-auto max-w-xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-requests")}
          className="-ml-3"
        >
          <ArrowLeft className="size-4" />
          Back to My Requests
        </Button>

        <h2 className="text-3xl font-bold">New Request</h2>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          {submitError && (
            <p
              role="alert"
              className="rounded-md border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {submitError}
            </p>
          )}

          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              onBlur={() => markTouched("title")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              onBlur={() => markTouched("description")}
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            {touched.description && errors.description && (
              <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                onBlur={() => markTouched("category")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)]"
              >
                <option value="">Select category</option>
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="facilities">Facilities</option>
                <option value="access">Access</option>
              </select>
              {touched.category && errors.category && (
                <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="mb-1 block text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                onBlur={() => markTouched("priority")}
                className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)]"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {touched.priority && errors.priority && (
                <p className="mt-1 text-sm text-[var(--color-danger)]">{errors.priority}</p>
              )}
            </div>
          </div>

          <Button type="submit" variant="info" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create request"}
          </Button>
        </form>
      </section>
    </AppLayout>
  );
}

export default NewRequestPage;
