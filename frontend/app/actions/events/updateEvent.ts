"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function updateEvent(event: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!event?.uuid) return { success: false, error: "Missing event UUID" };

    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

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

    return { success: true };
  } catch (err) {
    Logger.error(`updateEvent failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update event." };
  }
}
