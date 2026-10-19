"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin } from "@/lib/token";
import type { AdvanceCycleResult } from "@/lib/types/Internship";

export default async function advanceApplicationCycle(newCycle: string): Promise<AdvanceCycleResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.cycleAdvance}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newCycle }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        data?.message ??
        `Request failed (${response.status})`;
      Logger.error(`advanceApplicationCycle failed: ${msg}`);
      return { success: false, error: msg };
    }

    return {
      success: true,
      previousCycle: data.previousCycle,
      newCycle: data.newCycle,
      archivedCount: typeof data.archivedCount === "number" ? data.archivedCount : 0,
    };
  } catch (err) {
    Logger.error(`advanceApplicationCycle failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to advance application cycle." };
  }
}
