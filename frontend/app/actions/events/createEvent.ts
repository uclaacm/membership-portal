"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import sendMarketingNotification from "@/lib/marketingMail";

export default async function createEvent(
  event: any
): Promise<{ success: boolean; error?: string; marketingNotified?: boolean; marketingNote?: string }> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.events.event, {
      method: "POST",
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

    // Marketing is told only once the event actually saved, and only when the author picked
    // platforms. A failure here must never fail the save — the event exists either way.
    if (Array.isArray(event?.platforms) && event.platforms.length > 0) {
      const mail = await sendMarketingNotification(event, true);
      if (!mail.sent) Logger.error(`Marketing not notified: ${mail.skipped ?? mail.error}`);
      return { success: true, marketingNotified: mail.sent, marketingNote: mail.skipped ?? mail.error };
    }

    return { success: true };
  } catch (err) {
    Logger.error(`createEvent failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to create event." };
  }
}
