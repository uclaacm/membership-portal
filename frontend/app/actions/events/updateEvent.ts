"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import sendMarketingNotification, { MARKETING_FIELDS } from "@/lib/marketingMail";

/** Normalises a value for comparison so a Date and its ISO string are not treated as a change. */
const asComparable = (value: any) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value?.toISOString === "function") return value.toISOString();
  return String(value);
};

export default async function updateEvent(
  event: any
): Promise<{ success: boolean; error?: string; marketingNotified?: boolean; marketingNote?: string }> {
  try {
    if (!event?.uuid) return { success: false, error: "Missing event UUID" };

    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    // Read the event as it stands so the notification can be limited to changes marketing
    // cares about. A points-only edit should not land in anyone's inbox.
    let previous: any = null;
    if (Array.isArray(event?.platforms) && event.platforms.length > 0) {
      try {
        const existing = await fetch(
          `${Config.API_URL + Config.routes.events.event}/${event.uuid}`,
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" }
        );
        previous = (await existing.json())?.event ?? null;
      } catch {
        // If the before-state cannot be read, fall through and notify — a spurious email is a
        // far smaller problem than a silently missed one.
      }
    }

    const response = await fetch(`${Config.API_URL + Config.routes.events.event}/${event.uuid}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ event }),
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        return { success: false, error: `Request failed (${response.status})` };
      }
    }

    if (!response.ok) {
      const msg = data?.error?.message ?? data?.error ?? `Request failed (${response.status})`;
      return { success: false, error: msg };
    }

    if (data?.error) {
      return { success: false, error: data.error.message ?? data.error };
    }

    if (Array.isArray(event?.platforms) && event.platforms.length > 0) {
      const changed = !previous
        || MARKETING_FIELDS.some((f) => asComparable(event[f]) !== asComparable(previous[f]));

      if (changed) {
        const mail = await sendMarketingNotification(event, false);
        if (!mail.sent) Logger.error(`Marketing not notified: ${mail.skipped ?? mail.error}`);
        return { success: true, marketingNotified: mail.sent, marketingNote: mail.skipped ?? mail.error };
      }
    }

    return { success: true };
  } catch (err) {
    Logger.error(`updateEvent failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update event." };
  }
}
