"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function checkIn(attendanceCode: string): Promise<{ success: boolean; points?: number; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.attendance.attend, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      body: JSON.stringify({ attendanceCode }),
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    return { success: true, points: data.points ?? 0 };
  } catch (err) {
    Logger.error(`Check-in failed: ${(err as Error).message}`);
    return { success: false, error: "Check-in failed. Please try again." };
  }
}
