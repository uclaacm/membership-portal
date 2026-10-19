import "server-only";

import Logger from "@/lib/logger";

/**
 * Marketing notification transport.
 *
 * Nothing in this repo sent email before this, so the transport is deliberately pluggable and
 * defaults to off. Every credential here is server-side only — never an NEXT_PUBLIC_ variable,
 * and never returned to the client.
 *
 * Configure with:
 *   MARKETING_EMAIL_TRANSPORT   "none" (default) | "api"
 *   MARKETING_EMAIL_TO          defaults to marketing@uclaacm.com
 *   MARKETING_EMAIL_FROM        the send-from address
 *   MARKETING_EMAIL_API_URL     transactional provider endpoint
 *   MARKETING_EMAIL_TOKEN       provider token
 *
 * The "api" transport is a plain HTTPS POST so it needs no new dependency. SMTP and the Google
 * Workspace service-account route both require a package (nodemailer / googleapis) and are
 * intentionally not implemented here — see IMPLEMENTATION_NOTES.md for the tradeoffs.
 */

export interface MarketingEvent {
  title: string;
  committee?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  cover?: string;
  description?: string;
  platforms?: string[];
  uuid?: string;
}

export interface MailResult {
  /** True only when a message actually went out. */
  sent: boolean;
  /** Why nothing was sent — shown to the user as "marketing not notified", never as a failure. */
  skipped?: string;
  error?: string;
}

const DEFAULT_TO = "marketing@uclaacm.com";

/** Strips stored rich text down to something readable in an inbox. */
const plain = (html?: string) =>
  String(html ?? "")
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function buildMessage(event: MarketingEvent, isNew: boolean, portalUrl: string) {
  const kind = isNew ? "New event" : "Updated event";
  const subject = `${kind}: ${event.title}${event.committee ? ` (${event.committee})` : ""}`;

  const when = event.startDate
    ? new Date(event.startDate).toLocaleString("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Los_Angeles",
      })
    : "Date TBD";

  // Plain text on purpose: this is an internal heads-up, and a text body renders predictably
  // in every client without a template to maintain.
  const body = [
    `${kind} needs marketing assets.`,
    "",
    `Title:       ${event.title}`,
    `Committee:   ${event.committee || "ACM"}`,
    `When:        ${when}`,
    `Location:    ${event.location || "TBD"}`,
    `Platforms:   ${(event.platforms ?? []).join(", ") || "none"}`,
    `Cover image: ${event.cover || "none"}`,
    "",
    "Description:",
    plain(event.description) || "(none)",
    "",
    `In the portal: ${portalUrl}`,
  ].join("\n");

  return { subject, body };
}

export default async function sendMarketingNotification(
  event: MarketingEvent,
  isNew: boolean
): Promise<MailResult> {
  const transport = (process.env.MARKETING_EMAIL_TRANSPORT ?? "none").toLowerCase();
  const to = process.env.MARKETING_EMAIL_TO || DEFAULT_TO;
  const from = process.env.MARKETING_EMAIL_FROM;

  if (transport === "none") {
    return { sent: false, skipped: "No email transport is configured." };
  }

  const { subject, body } = buildMessage(
    event,
    isNew,
    `${process.env.PORTAL_URL ?? "https://portal.uclaacm.com"}/events`
  );

  if (transport === "api") {
    const url = process.env.MARKETING_EMAIL_API_URL;
    const token = process.env.MARKETING_EMAIL_TOKEN;
    if (!url || !token || !from) {
      return { sent: false, skipped: "Email transport is incompletely configured." };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: [to], subject, text: body }),
      });

      if (!response.ok) {
        // Never surface the provider's body — it can echo the token back.
        return { sent: false, error: `Mail provider returned ${response.status}` };
      }
      return { sent: true };
    } catch (err) {
      return { sent: false, error: (err as Error).message };
    }
  }

  Logger.error(`Unknown MARKETING_EMAIL_TRANSPORT: ${transport}`);
  return { sent: false, skipped: `Unknown transport "${transport}".` };
}

/** Fields a change to which marketing actually cares about. A points-only edit is not one. */
export const MARKETING_FIELDS = ["title", "startDate", "endDate", "location", "cover", "committee"];
