import { useState, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { requests, cancelRequest, messages as allMessages, createMessage, users } from "../data";
import type { Message } from "../shared/types";

function getUserName(id: string | null) {
  if (!id) {
    return "Unassigned";
  }

  return users.find((user) => user.id === id)?.name ?? "Unknown";
}

function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState(() => requests.find((r) => r.id === id));
  const [threadMessages, setThreadMessages] = useState<Message[]>(() =>
    allMessages.filter((message) => message.requestId === id)
  );
  const [commentBody, setCommentBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

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

  const canComment = request.status === "open" || request.status === "pending";
  const canCancel = request.status === "open";

  function handleCancelConfirm() {
    if (!request) {
      return;
    }

    const updated = cancelRequest(request.id);

    if (updated) {
      setRequest({ ...updated });
      const systemMessage = createMessage({
        requestId: request.id,
        authorId: request.requesterId,
        body: "Cancelled by requester",
      });
      setThreadMessages((prev) => [...prev, systemMessage]);
    }

    setCancelConfirmOpen(false);
  }

  function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();

    if (!request || !commentBody.trim() || isSending) {
      return;
    }

    setIsSending(true);

    // Simulated latency so the disable-while-sending state is visible before Day 5 wires a real API.
    setTimeout(() => {
      const message = createMessage({
        requestId: request.id,
        authorId: request.requesterId,
        body: commentBody.trim(),
      });

      setThreadMessages((prev) => [...prev, message]);
      setCommentBody("");
      setIsSending(false);
    }, 400);
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
