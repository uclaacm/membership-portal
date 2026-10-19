"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenAdmin, isTokenOfficer } from "@/lib/token";

export type FetchApplicationStatusCountsResult =
  | { success: true; counts: Record<string, number> }
  | { success: false; error: string };

export default async function fetchApplicationStatusCounts(
  committeeId?: string,
): Promise<FetchApplicationStatusCountsResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) {
      return { success: false, error: "Not authenticated" };
    }
    if (!isTokenAdmin(token) && !isTokenOfficer(token)) {
      return { success: false, error: "Not authorized" };
    }

    const params = new URLSearchParams();
    if (committeeId) params.set("committeeId", committeeId);

    const url = `${Config.API_URL}${Config.routes.internship.applicationStatusCounts}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      const message = data?.message ?? data?.error ?? `Request failed (${response.status})`;
      Logger.error(`fetchApplicationStatusCounts failed: ${message}`);
      return { success: false, error: message };
    }

    return { success: true, counts: data.counts ?? {} };
  } catch (err) {
    Logger.error(`fetchApplicationStatusCounts failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch application status counts" };
  }
}
