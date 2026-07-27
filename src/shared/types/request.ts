export type RequestStatus =
  | "open"
  | "pending"
  | "closed"
  | "cancelled";

export type RequestPriority =
  | "low"
  | "medium"
  | "high";

export type RequestCategory =
  | "hardware"
  | "software"
  | "facilities"
  | "access";

export interface Request {
  id: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  category: RequestCategory;
  requesterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}