"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin } from "@/lib/token";
import type { FetchCycleInfoResult, InternshipCycleInfo } from "@/lib/types/Internship";

export default async function fetchApplicationCycle(): Promise<FetchCycleInfoResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.cycle}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        data?.message ??
        `Request failed (${response.status})`;
      Logger.error(`fetchApplicationCycle failed: ${msg}`);
      return { success: false, error: msg };
    }

    const info: InternshipCycleInfo = {
      currentCycle: data.currentCycle,
      suggestedNextCycle: data.suggestedNextCycle,
      pastCycles: Array.isArray(data.pastCycles) ? data.pastCycles : [],
    };

    return { success: true, data: info };
  } catch (err) {
    Logger.error(`fetchApplicationCycle failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch application cycle." };
  }
}
