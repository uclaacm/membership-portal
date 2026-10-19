"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

interface AdminLeaderboardFilters {
  year?: string;
  role?: string;
  committee?: string;
}

interface AdminLeaderboardResponse {
  leaderboard: any[];
}

export default async function fetchAdminLeaderboard(
  filters: AdminLeaderboardFilters = {}
): Promise<AdminLeaderboardResponse> {
  try {
    const cks = await cookies();
    const params = new URLSearchParams();

    if (filters.year) params.set("year", filters.year);
    if (filters.role) params.set("role", filters.role);
    if (filters.committee) params.set("committee", filters.committee);

    const query = params.toString();
    const url = Config.API_URL + Config.routes.leaderboardAdmin + (query ? `?${query}` : "");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch admin leaderboard");

    return {
      leaderboard: data.leaderboard ?? [],
    };
  } catch (err) {
    Logger.error(`Fetch admin leaderboard failed: ${(err as Error).message}`);
    throw err;
  }
}
