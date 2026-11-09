"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin } from "@/lib/token";
import type {
  UpdateInternshipCommitteePayload,
  UpdateInternshipCommitteeResult,
  InternshipCommittee,
} from "@/lib/types/Internship";

export default async function updateCommittee(
  committeeId: string,
  payload: UpdateInternshipCommitteePayload,
): Promise<UpdateInternshipCommitteeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(
      `${Config.API_URL}${Config.routes.internship.committees}/${committeeId}/admin`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.error?.message ??
        (typeof data?.error === "string" ? data.error : undefined) ??
        data?.message ??
        `Request failed (${response.status})`;
      Logger.error(`updateCommittee failed: ${msg}`);
      return { success: false, error: msg };
    }

    const updated: InternshipCommittee | undefined = data?.committee;
    if (!updated) {
      Logger.error("updateCommittee failed: missing committee in response");
      return { success: false, error: "Failed to update committee." };
    }

    return { success: true, data: updated };
  } catch (err) {
    Logger.error(`updateCommittee failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update committee." };
  }
}
