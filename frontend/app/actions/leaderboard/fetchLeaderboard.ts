"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface LeaderboardSelf {
  uuid: string | null;
  /** null only when the caller is not an active member, so has no position at all. */
  rank: number | null;
  points: number;
}

export interface LeaderboardResult {
  leaderboard: any[];
  /** Total ranked members, not the length of this page. */
  total: number;
  me: LeaderboardSelf;
}

const EMPTY: LeaderboardResult = {
  leaderboard: [],
  total: 0,
  me: { uuid: null, rank: null, points: 0 },
};

/**
 * Leaderboard page plus the caller's own standing.
 *
 * `me` is what lets the dashboard pin the current user's row and fill the modal footer without
 * paging through every member to find them.
 */
export default async function fetchLeaderboard(limit?: number): Promise<LeaderboardResult> {
  try {
    const cks = await cookies();
    const query = limit && limit > 0 ? `?limit=${Math.floor(limit)}` : "";

    const response = await fetch(`${Config.API_URL}${Config.routes.leaderboard}${query}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch leaderboard");

    return {
      leaderboard: data.leaderboard ?? [],
      total: data.total ?? (data.leaderboard ?? []).length,
      me: data.me ?? EMPTY.me,
    };
  } catch (err) {
    Logger.error(`Fetch leaderboard failed: ${(err as Error).message}`);
    return EMPTY;
  }
}
