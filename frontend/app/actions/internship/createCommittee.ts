"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isTokenAdmin } from "@/lib/token";
import type {
  CreateInternshipCommitteePayload,
  CreateInternshipCommitteeResult,
  InternshipCommittee,
} from "@/lib/types/Internship";

export default async function createCommittee(
  committee: CreateInternshipCommitteePayload,
): Promise<CreateInternshipCommitteeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(Config.API_URL + Config.routes.internship.committees, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(committee),
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      if (!response.ok) {
        const msg = `Request failed (${response.status})`;
        Logger.error(`createCommittee failed: ${msg}`);
        return { success: false, error: msg };
      }
    }

    if (!response.ok) {
      const msg =
        data?.message ??
        (typeof data?.error === "string" ? data.error : data?.error?.message) ??
        `Request failed (${response.status})`;
      Logger.error(`createCommittee failed: ${msg}`);
      return { success: false, error: msg };
    }

    if (data?.error) {
      const msg = typeof data.error === "string" ? data.error : data.error.message;
      Logger.error(`createCommittee failed: ${msg}`);
      return { success: false, error: msg };
    }

    const created: InternshipCommittee | undefined = data?.committee;
    if (!created) {
      Logger.error("createCommittee failed: missing committee in response");
      return { success: false, error: "Failed to create committee." };
    }

    return { success: true, data: created };
  } catch (err) {
    Logger.error(`createCommittee failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to create committee." };
  }
}
