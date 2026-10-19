"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import type { InternshipCommittee, FetchCommitteeByIdResult } from "@/lib/types/Internship";

export default async function fetchCommitteeById(committeeId: string): Promise<FetchCommitteeByIdResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.committees}/${committeeId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return { success: false, error: data?.error?.message ?? "Failed to fetch committee." };

    return { success: true, data: data.committee as InternshipCommittee };
  } catch (error) {
    Logger.error(`fetchCommitteeById failed: ${(error as Error).message}`);
    return { success: false, error: "Failed to fetch committee." };
  }
}
