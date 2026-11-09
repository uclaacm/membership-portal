"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchCheckedInEvents(): Promise<{ success: boolean; eventUuids?: Set<string>; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.attendance.fetch, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    const eventUuids = new Set<string>(data.attendance.map((record: { event: string }) => record.event));
    return { success: true, eventUuids };
  } catch (err) {
    Logger.error(`Fetch checked-in events failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch attendance." };
  }
}
