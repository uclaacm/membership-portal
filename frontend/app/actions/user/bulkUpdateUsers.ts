"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface BulkUpdatePayload {
  uuids?: string[];
  emails?: string[];
  role?: "Member" | "Officer" | "Admin";
  committees?: string[];
  committeeMode?: "add" | "remove" | "replace";
}

export interface BulkUpdateResult {
  success: boolean;
  error?: string;
  updated: Array<{ uuid: string; email: string; role: string; committees: string[] }>;
  failed: Array<{ identifier: string; reason: string }>;
}

/**
 * Bulk role and committee assignment.
 *
 * `updated` and `failed` are both returned on success: a request that changed some users and
 * could not find others is a normal outcome, not an error, and the caller shows both.
 */
export default async function bulkUpdateUsers(
  payload: BulkUpdatePayload
): Promise<BulkUpdateResult> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.user.bulk}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data || data.error) {
      return {
        success: false,
        error: data?.error?.message ?? "Bulk update failed",
        updated: [],
        failed: [],
      };
    }

    return { success: true, updated: data.updated ?? [], failed: data.failed ?? [] };
  } catch (err) {
    Logger.error(`bulkUpdateUsers failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message, updated: [], failed: [] };
  }
}
