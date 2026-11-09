"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenAdmin } from "@/lib/token";
import type {
  BulkUpdateCommitteeStatusPayload,
  BulkUpdateCommitteeStatusResult,
} from "@/lib/types/Internship";

export default async function bulkUpdateCommitteeStatus(
  payload: BulkUpdateCommitteeStatusPayload,
): Promise<BulkUpdateCommitteeStatusResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) {
      return { success: false, error: "Not authenticated" };
    }

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const body: { action: "open" | "close"; committeeIds?: string[] } = { action: payload.action };
    if (payload.committeeIds && payload.committeeIds.length > 0) {
      body.committeeIds = payload.committeeIds;
    }

    const response = await fetch(
      `${Config.API_URL}${Config.routes.internship.committeesBulkStatus}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const message =
        data?.error?.message ?? data?.message ?? `Request failed (${response.status})`;
      Logger.error(`bulkUpdateCommitteeStatus failed: ${message}`);
      return { success: false, error: message };
    }

    return { success: true, modified: typeof data.modified === "number" ? data.modified : 0 };
  } catch (err) {
    Logger.error(`bulkUpdateCommitteeStatus failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update committee status" };
  }
}
