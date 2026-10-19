"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin, isTokenOfficer } from "@/lib/token";
import type {
  InternshipCustomQuestion,
  InternshipCommittee,
  UpdateInternshipCommitteeResult,
} from "@/lib/types/Internship";

// Hits PUT /committees/:id/questions — the narrower endpoint officers can
// use to edit their own committee's questions (backend scopes it via
// canManageCommitteeResource), as opposed to /committees/:id/admin which
// is admin-only and covers the full committee record.
export default async function updateCommitteeQuestions(
  committeeId: string,
  customQuestions: InternshipCustomQuestion[],
): Promise<UpdateInternshipCommitteeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token) && !isTokenOfficer(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(
      `${Config.API_URL}${Config.routes.internship.committees}/${committeeId}/questions`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customQuestions }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        data?.message ??
        `Request failed (${response.status})`;
      Logger.error(`updateCommitteeQuestions failed: ${msg}`);
      return { success: false, error: msg };
    }

    const updated: InternshipCommittee | undefined = data?.committee;
    if (!updated) {
      Logger.error("updateCommitteeQuestions failed: missing committee in response");
      return { success: false, error: "Failed to update questions." };
    }

    return { success: true, data: updated };
  } catch (err) {
    Logger.error(`updateCommitteeQuestions failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update questions." };
  }
}
