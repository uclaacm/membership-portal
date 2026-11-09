"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchUserRSVPs(): Promise<{ success: boolean; rsvps?: any[]; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.rsvp.get, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    return { success: true, rsvps: data.rsvps ?? [] };
  } catch (err) {
    Logger.error(`fetchUserRSVPs failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch RSVPs." };
  }
}
