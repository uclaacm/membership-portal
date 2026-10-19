"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function createRSVP(eventUuid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.rsvp.create, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      body: JSON.stringify({ event: { uuid: eventUuid } }),
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = `Request failed (${response.status})`;
      try { msg = JSON.parse(text)?.error?.message ?? msg; } catch {}
      return { success: false, error: msg };
    }

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    return { success: true };
  } catch (err) {
    Logger.error(`createRSVP failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to create RSVP." };
  }
}
