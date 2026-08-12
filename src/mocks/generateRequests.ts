import type {
  Message,
  Request,
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "../shared/types";

// Realistic-sounding titles per category, so search/filter demos against
// this bulk data still return sensible, on-topic matches 
const TITLES_BY_CATEGORY: Record<RequestCategory, string[]> = {
  hardware: [
    "Laptop won't turn on",
    "Monitor flickering",
    "Keyboard keys not working",
    "Mouse not responding",
    "Printer jammed",
    "Docking station not detected",
    "Headset microphone not working",
    "External hard drive not recognized",
    "Laptop battery draining fast",
    "Webcam not working in meetings",
  ],
  software: [
    "VPN disconnects frequently",
    "Outlook won't sync",
    "Software license expired",
    "App crashes on startup",
    "Cannot install update",
    "Slow computer performance",
    "Browser keeps freezing",
    "Email attachments not opening",
    "Antivirus blocking application",
    "Password reset not working",
  ],
  facilities: [
    "Office air conditioner not working",
    "Broken chair in meeting room",
    "Light flickering in hallway",
    "Elevator out of service",
    "Restroom sink leaking",
    "Heating not working",
    "Parking gate malfunctioning",
    "Meeting room projector broken",
    "Water dispenser empty",
    "Desk needs replacement",
  ],
  access: [
    "Badge access not working",
    "Need access to server room",
    "VPN access request",
    "Shared drive permission denied",
    "Cannot access HR portal",
    "New hire needs system access",
    "Access card deactivated",
    "Building entry badge lost",
    "Restricted folder access needed",
    "Guest wifi access request",
  ],
};

const CATEGORIES: RequestCategory[] = ["hardware", "software", "facilities", "access"];
const PRIORITIES: RequestPriority[] = ["low", "medium", "high"];
const STATUSES: RequestStatus[] = ["open", "pending", "closed", "cancelled"];
const STAFF_IDS = ["u2", "u3"];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomTimestamp(maxDaysAgo: number): string {
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

export function generateRequests(count: number, requesterId: string): Request[] {
  return Array.from({ length: count }, (_, index) => {
    const category = pickRandom(CATEGORIES);
    const status = pickRandom(STATUSES);
    const createdAt = randomTimestamp(90);
    // Only non-open requests are likely to have been picked up by staff.
    const isAssigned = status !== "open" && Math.random() > 0.3;

    return {
      id: crypto.randomUUID(),
      title: `${pickRandom(TITLES_BY_CATEGORY[category])} #${index + 1}`,
      status,
      priority: pickRandom(PRIORITIES),
      category,
      requesterId,
      assigneeId: isAssigned ? pickRandom(STAFF_IDS) : null,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

// Every request needs its description as the first message in its thread
// (spec §4) - generated requests were previously seeded with zero messages,
// leaving an empty thread on click. Reuses the request's own title rather
// than a second content pool, since the title already reads like a
// plausible one-line issue report.
export function generateMessagesForRequests(requests: Request[]): Message[] {
  return requests.map((request) => ({
    id: crypto.randomUUID(),
    requestId: request.id,
    authorId: request.requesterId,
    body: `${request.title}. Please look into this when you get a chance.`,
    createdAt: request.createdAt,
  }));
}
