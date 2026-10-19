"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenAdmin } from "@/lib/token";
import type {
  FetchCommitteesResult,
  InternshipCommitteeAdminListItem,
} from "@/lib/types/Internship";

export default async function fetchCommittees(): Promise<FetchCommitteesResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) {
      return { success: false, error: "Not authenticated" };
    }

    if (!isTokenAdmin(token)) {
      return { success: false, error: "Not authorized" };
    }

    const response = await fetch(`${Config.API_URL}${Config.routes.internship.committeesAdmin}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      const message = data?.error?.message ?? data?.message ?? "Failed to fetch committees";
      Logger.error(`fetchCommittees failed: ${message}`);
      return { success: false, error: message };
    }

    const raw = Array.isArray(data?.committees) ? data.committees : [];
    const committees: InternshipCommitteeAdminListItem[] = raw.map((c: any) => ({
      ...c,
      id: c.id ?? c._id,
    }));

    return { success: true, data: committees };
  } catch (err) {
    Logger.error(`fetchCommittees failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch committees" };
  }
}
