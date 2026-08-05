import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useEffect, useState, type FormEvent } from "react";
import { requestService } from "../services/requestService";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";
import { useAuth } from "../features/auth/useAuth";

import type { Message, Request, User } from "../shared/types";

function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<Request | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  function getUserName(userId: string | null) {
    if (!userId) {
      return "Unassigned";
    }

    return users.find((user) => user.id === userId)?.name ?? "Unknown";
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // Load request, messages, and users when the component mounts or the ID changes
  useEffect(() => {
  async function loadData() {
    if (!id) return;

    try {
      setLoading(true);

      const [request, messages, users] = await Promise.all([
        requestService.getById(id),
        messageService.getByRequestId(id),
        userService.getAll(),
      ]);

      setRequest(request);
      setThreadMessages(messages);
      setUsers(users);
      setError(null);
    } catch {
      setError("Failed to load request.");
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, [id, retryCount]);

  if (loading) {
    return (
      <AppLayout>
        <p className="p-6">Loading request...</p>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="space-y-4 p-6">
          <p>{error}</p>

          <Button onClick={() => setRetryCount((count) => count + 1)}>
            Retry
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Request not found</h2>
          <p className="text-[var(--color-text-secondary)]">
            This request may have been removed, or the link is incorrect.
          </p>
          <Button onClick={() => navigate("/my-requests")}>Back to My Requests</Button>
        </section>
      </AppLayout>
    );
  }

  if (!user) {
    // ProtectedRoute guarantees a logged-in user reaches this page; this
    // just satisfies the type checker and keeps the component safe in
    // isolation, without asserting past the AuthContextValue type.
    return null;
  }

  const isOwner = user.id === request.requesterId;
  const isStaff = user.role === "technician" || user.role === "admin";

  if (!isOwner && !isStaff) {
    return (
      <AppLayout>
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Not authorized</h2>
          <p className="text-[var(--color-text-secondary)]">
            You don't have permission to view this request.
          </p>
          <Button onClick={() => navigate("/my-requests")}>Back to My Requests</Button>
        </section>
      </AppLayout>
    );
  }

  const canComment = request.status === "open" || request.status === "pending";
  const canCancel = request.status === "open";

  async function handleCancelConfirm() {
    if (!request || !user) {
      return;
    }

    try {
      const updated = await requestService.update(request.id, {
        status: "cancelled",
      });

      setRequest(updated);

      const systemMessage = {
        id: crypto.randomUUID(),
        requestId: request.id,
        authorId: user.id,
        body: "Cancelled by requester",
        createdAt: new Date().toISOString(),
      };

      await messageService.create(systemMessage);

      setThreadMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    } finally {
      setCancelConfirmOpen(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();

    if (!request || !user || !commentBody.trim() || isSending) {
      return;
    }

    setIsSending(true);

    const message = {
      id: crypto.randomUUID(),
      requestId: request.id,
      authorId: user.id,
      body: commentBody.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await messageService.create(message);

      setThreadMessages((prev) => [...prev, message]);
      setCommentBody("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AppLayout>
      <section className="space-y-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">{request.title}</h2>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={request.status}>{request.status}</Badge>
                <Badge variant={request.priority}>{request.priority}</Badge>
                <Badge variant={request.category}>{request.category}</Badge>
              </div>
            </div>

            {canCancel && (
              <Button variant="danger" onClick={() => setCancelConfirmOpen(true)}>
                Cancel request
              </Button>
            )}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <dt className="font-medium text-[var(--color-text)]">Requester</dt>
              <dd className="text-[var(--color-text-secondary)]">
                {getUserName(request.requesterId)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-text)]">Assignee</dt>
              <dd className="text-[var(--color-text-secondary)]">
                {getUserName(request.assigneeId)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3">
          {threadMessages.map((message) => (
            <div
              key={message.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-sm font-medium">{getUserName(message.authorId)}</p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{message.body}</p>
            </div>
          ))}
        </div>

        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-3">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <input
              id="comment"
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            <Button type="submit" disabled={isSending || !commentBody.trim()}>
              {isSending ? "Sending..." : "Send"}
            </Button>
          </form>
        ) : (
          <p className="text-sm italic text-[var(--color-text-secondary)]">
            This request is {request.status} — the thread is read-only.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={isCancelConfirmOpen}
        title="Cancel this request?"
        description="This can't be undone. The requester and any assignee will see it as cancelled."
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        variant="danger"
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelConfirmOpen(false)}
      />
    </AppLayout>
  );
}

export default RequestDetailPage;
