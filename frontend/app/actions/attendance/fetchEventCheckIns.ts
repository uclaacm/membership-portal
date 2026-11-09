"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchEventCheckIns(eventUuid: string): Promise<{ success: boolean; attendance?: any[]; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.attendance.fetch}/${eventUuid}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    return { success: true, attendance: data.attendance ?? [] };
  } catch (err) {
    Logger.error(`fetchEventCheckIns failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch event check-ins." };
  }
}
