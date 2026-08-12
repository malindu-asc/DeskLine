import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Send, User as UserIcon } from "lucide-react";
import AppLayout from "../layouts/AppLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useEffect, useState, type FormEvent } from "react";
import { requestService } from "../services/requestService";
import { messageService } from "../services/messageService";
import { userService } from "../services/userService";
import { ApiError } from "../services/errors";
import { useAuth } from "../features/auth/useAuth";
import { getUserName } from "../shared/utils/getUserName";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";

import type { Message, Request, User } from "../shared/types";

function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState<Request | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [commentBody, setCommentBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isCloseConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  // One shared flag, not one per action - only one of Cancel/Close/Set
  // Pending/Reopen/Assign-to-me/Reassign can realistically be in flight
  // against a single request at a time, same reasoning as the single
  // shared `actionError` above.
  const [isMutating, setIsMutating] = useState(false);

  function describeActionError(err: unknown): string {
    if (err instanceof ApiError && err.status === 403) {
      return "You don't have permission to do that.";
    }

    return "Something went wrong. Please try again.";
  }

  // Load request, messages, and users when the component mounts or the ID changes
  useEffect(() => {
  async function loadData() {
    if (!id) return;

    try {
      setLoading(true);
      // Reset every outcome flag at the start of each attempt - otherwise a
      // stale error/forbidden from a previous attempt could mask whichever
      // outcome this attempt actually lands on (error is checked before
      // forbidden/!request in the render logic below).
      setError(null);
      setForbidden(false);

      const [request, messages, users] = await Promise.all([
        requestService.getById(id),
        messageService.getByRequestId(id),
        userService.getAll(),
      ]);

      setRequest(request);
      setThreadMessages(messages);
      setUsers(users);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setForbidden(true);
      } else if (err instanceof ApiError && err.status === 404) {
        setRequest(null);
      } else {
        setError("Failed to load request.");
      }
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, [id, retryCount]);

  if (loading) {
    return (
      <AppLayout>
        <LoadingState message="Loading request..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <ErrorState message={error} onRetry={() => setRetryCount((count) => count + 1)} />
      </AppLayout>
    );
  }

  if (!user) {
    // ProtectedRoute guarantees a logged-in user reaches this page; this
    // just satisfies the type checker and keeps the component safe in
    // isolation, without asserting past the AuthContextValue type.
    return null;
  }

  const homePath = user.role === "requester" ? "/my-requests" : "/queue";
  const homeLabel = user.role === "requester" ? "Back to My Requests" : "Back to Queue";

  if (forbidden) {
    return (
      <AppLayout>
        <section className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Not authorized</h2>
          <p className="text-[var(--color-text-secondary)]">
            You don't have permission to view this request.
          </p>
          <Button onClick={() => navigate(homePath)}>{homeLabel}</Button>
        </section>
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
          <Button onClick={() => navigate(homePath)}>{homeLabel}</Button>
        </section>
      </AppLayout>
    );
  }

  const isOwner = user.id === request.requesterId;
  const isStaff = user.role === "technician" || user.role === "admin";

  const canComment = request.status === "open" || request.status === "pending";
  const canCancel = user.role === "requester" && isOwner && request.status === "open";
  const canSetPending = isStaff && request.status === "open";
  const canReopen = isStaff && request.status === "pending";
  const canClose = user.role === "admin" && (request.status === "open" || request.status === "pending");
  const canAssignToMe =
    isStaff &&
    (request.status === "open" || request.status === "pending") &&
    request.assigneeId !== user.id;
  const staffUsers = users.filter((u) => u.role === "technician" || u.role === "admin");
  const canReassign = user.role === "admin" && (request.status === "open" || request.status === "pending");
  const hasAnyAction = canSetPending || canReopen || canAssignToMe || canClose || canCancel || canReassign;

  async function handleCancelConfirm() {
    if (!request || !user) {
      return;
    }

    setActionError(null);
    setIsMutating(true);

    try {
      // Posted before the status change: the mock API only accepts new
      // messages while a request is open/pending, so this must land while
      // that's still true, not after cancellation has already taken effect.
      const systemMessage = {
        id: crypto.randomUUID(),
        requestId: request.id,
        authorId: user.id,
        body: "Cancelled by requester",
        createdAt: new Date().toISOString(),
      };

      await messageService.create(systemMessage);
      setThreadMessages((prev) => [...prev, systemMessage]);

      const updated = await requestService.update(request.id, {
        status: "cancelled",
      });

      setRequest(updated);
    } catch (error) {
      setActionError(describeActionError(error));
      console.error("Failed to cancel request:", error);
    } finally {
      setCancelConfirmOpen(false);
      setIsMutating(false);
    }
  }

  async function handleStatusChange(nextStatus: "open" | "pending") {
    if (!request) {
      return;
    }

    setActionError(null);
    setIsMutating(true);

    try {
      const updated = await requestService.update(request.id, {
        status: nextStatus,
      });

      setRequest(updated);
    } catch (error) {
      setActionError(describeActionError(error));
      console.error("Failed to update request status:", error);
    } finally {
      setIsMutating(false);
    }
  }

  async function handleAssignToMe() {
    if (!request || !user) {
      return;
    }

    setActionError(null);
    setIsMutating(true);

    try {
      const updated = await requestService.update(request.id, {
        assigneeId: user.id,
      });

      setRequest(updated);
    } catch (error) {
      setActionError(describeActionError(error));
      console.error("Failed to assign request:", error);
    } finally {
      setIsMutating(false);
    }
  }

  // Reassign to another staff member
  async function handleReassign() {
    if (!request || !reassignTo || reassignTo === request.assigneeId) {
      return;
    }

    setActionError(null);
    setIsMutating(true);

    try {
      const updated = await requestService.update(request.id, {
        assigneeId: reassignTo,
      });

      setRequest(updated);
      setReassignTo("");
    } catch (error) {
      setActionError(describeActionError(error));
      console.error("Failed to reassign request:", error);
    } finally {
      setIsMutating(false);
    }
  }


  async function handleCloseConfirm() {
    if (!request || !user) {
      return;
    }

    setActionError(null);
    setIsMutating(true);

    try {
      // Posted before the status change - see handleCancelConfirm for why.
      const systemMessage = {
        id: crypto.randomUUID(),
        requestId: request.id,
        authorId: user.id,
        body: "Closed by admin",
        createdAt: new Date().toISOString(),
      };

      await messageService.create(systemMessage);
      setThreadMessages((prev) => [...prev, systemMessage]);

      const updated = await requestService.update(request.id, {
        status: "closed",
      });

      setRequest(updated);
    } catch (error) {
      setActionError(describeActionError(error));
      console.error("Failed to close request:", error);
    } finally {
      setCloseConfirmOpen(false);
      setIsMutating(false);
    }
  }

  async function handleCommentSubmit(event: FormEvent) {
    event.preventDefault();

    if (!request || !user || !commentBody.trim() || isSending) {
      return;
    }

    setIsSending(true);
    setActionError(null);

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
      setActionError(describeActionError(error));
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }

  const requesterName = getUserName(users, request.requesterId);
  const assigneeName = getUserName(users, request.assigneeId);
  const createdDate = new Date(request.createdAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
  const updatedDate = new Date(request.updatedAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <AppLayout>
      <section className="space-y-6">
        <Link to={homePath} className="-ml-3 inline-block">
          <Button variant="ghost">
            <ArrowLeft className="size-4" />
            {homeLabel}
          </Button>
        </Link>

        {actionError && (
          <p
            role="alert"
            className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 px-3 py-2 text-sm text-[var(--color-danger)]"
          >
            {actionError}
          </p>
        )}

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-2xl font-bold">{request.title}</h2>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={request.status}>{request.status}</Badge>
            <Badge variant={request.priority}>{request.priority}</Badge>
            <Badge variant={request.category}>{request.category}</Badge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--color-text)]">Requester</dt>
              <dd className="mt-1 flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Avatar name={requesterName} size="sm" />
                <span className="truncate">{requesterName}</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-text)]">Assignee</dt>
              <dd className="mt-1 flex items-center gap-2 text-[var(--color-text-secondary)]">
                {request.assigneeId ? (
                  <Avatar name={assigneeName} size="sm" />
                ) : (
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                    <UserIcon className="size-3.5" />
                  </span>
                )}
                <span className="truncate">{assigneeName}</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-text)]">Created</dt>
              <dd className="mt-1 flex items-center gap-2 text-[var(--color-text-secondary)]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <Calendar className="size-3.5" />
                </span>
                <span>{createdDate}</span>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--color-text)]">Last updated</dt>
              <dd className="mt-1 flex items-center gap-2 text-[var(--color-text-secondary)]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--color-border)] text-[var(--color-text-secondary)]">
                  <Clock className="size-3.5" />
                </span>
                <span>{updatedDate}</span>
              </dd>
            </div>
          </dl>
        </div>

        {hasAnyAction && (
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Actions</h3>

            <div className="mt-2 flex flex-wrap gap-2">
              {canSetPending && (
                <Button variant="info" onClick={() => handleStatusChange("pending")} disabled={isMutating}>
                  Set Pending
                </Button>
              )}

              {canReopen && (
                <Button variant="info" onClick={() => handleStatusChange("open")} disabled={isMutating}>
                  Reopen
                </Button>
              )}

              {canAssignToMe && (
                <Button variant="info" onClick={handleAssignToMe} disabled={isMutating}>
                  Assign to me
                </Button>
              )}

              {canReassign && (
                <div className="flex items-center gap-2">
                  <label htmlFor="reassign-select" className="sr-only">
                    Reassign to
                  </label>
                  <select
                    id="reassign-select"
                    value={reassignTo}
                    onChange={(e) => setReassignTo(e.target.value)}
                    disabled={isMutating}
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)] disabled:opacity-50"
                  >
                    <option value="">Reassign to...</option>
                    {staffUsers.map((staffUser) => (
                      <option key={staffUser.id} value={staffUser.id}>
                        {staffUser.name}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="info"
                    onClick={handleReassign}
                    disabled={isMutating || !reassignTo || reassignTo === request.assigneeId}
                  >
                    Reassign
                  </Button>
                </div>
              )}


              {canClose && (
                <Button variant="danger" onClick={() => setCloseConfirmOpen(true)} disabled={isMutating}>
                  Close request
                </Button>
              )}

              {canCancel && (
                <Button variant="danger" onClick={() => setCancelConfirmOpen(true)} disabled={isMutating}>
                  Cancel request
                </Button>
              )}
            </div>
          </div>
        )}

        <h3 className="text-lg font-semibold text-[var(--color-text)]">Activity</h3>

        <div className="space-y-3">
          {threadMessages.map((message) => (
            <div
              key={message.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">{getUserName(users, message.authorId)}</p>
                <p className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                  {new Date(message.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">{message.body}</p>
            </div>
          ))}
        </div>

        {canComment ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <label htmlFor="comment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="comment"
              rows={3}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              className="w-full resize-y rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-info)]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSending || !commentBody.trim()}>
                <Send className="size-4" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm italic text-[var(--color-text-secondary)]">
            This request is {request.status} - the thread is read-only.
          </p>
        )}
      </section>

      <ConfirmDialog
        open={isCancelConfirmOpen}
        title="Cancel this request?"
        description="This can't be undone. The requester and any assignee will see it as cancelled."
        confirmLabel={isMutating ? "Cancelling..." : "Cancel request"}
        cancelLabel="Keep request"
        variant="danger"
        confirming={isMutating}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelConfirmOpen(false)}
      />

      <ConfirmDialog
        open={isCloseConfirmOpen}
        title="Close this request?"
        description="This can't be undone. The requester and any assignee will see it as closed."
        confirmLabel={isMutating ? "Closing..." : "Close request"}
        cancelLabel="Keep request"
        variant="danger"
        confirming={isMutating}
        onConfirm={handleCloseConfirm}
        onCancel={() => setCloseConfirmOpen(false)}
      />
    </AppLayout>
  );
}

export default RequestDetailPage;
