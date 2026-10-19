"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin, isTokenOfficer } from "@/lib/token";
import type { InternshipCommittee, UpdateInternshipCommitteeResult } from "@/lib/types/Internship";

// Hits PATCH /committees/:id/decisions-released, which shows or hides this committee's statuses
// on applicants' own applications. The backend limits it to admins and that committee's officers.
export default async function updateDecisionsReleased(
  committeeId: string,
  released: boolean,
): Promise<UpdateInternshipCommitteeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token) && !isTokenOfficer(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(
      `${Config.API_URL}${Config.routes.internship.committees}/${encodeURIComponent(committeeId)}/decisions-released`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ released }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        `Request failed (${response.status})`;
      Logger.error(`updateDecisionsReleased failed: ${msg}`);
      return { success: false, error: msg };
    }

    const updated: InternshipCommittee | undefined = data?.committee;
    if (!updated) {
      Logger.error("updateDecisionsReleased failed: missing committee in response");
      return { success: false, error: "Failed to update decisions." };
    }

    return { success: true, data: updated };
  } catch (err) {
    Logger.error(`updateDecisionsReleased failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update decisions." };
  }
}
