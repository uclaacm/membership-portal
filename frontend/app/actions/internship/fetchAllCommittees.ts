"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipCommittee } from "@/lib/types/Internship";

type FetchAllCommitteesResult =
  | { success: true; data: InternshipCommittee[] }
  | { success: false; error: string };

export default async function fetchAllCommittees(): Promise<FetchAllCommitteesResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.committees}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return { success: false, error: data?.error?.message ?? "Failed to fetch committees." };

    const raw: unknown[] = Array.isArray(data.committees)
      ? data.committees
      : Array.isArray(data.data)
        ? data.data
        : [];

    const committees: InternshipCommittee[] = raw.map((c) => {
      const rec = c as InternshipCommittee & { _id?: string };
      return { ...rec, id: rec.id ?? rec._id ?? "" };
    });

    return { success: true, data: committees };
  } catch (err) {
    Logger.error(`fetchAllCommittees failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch committees." };
  }
}
