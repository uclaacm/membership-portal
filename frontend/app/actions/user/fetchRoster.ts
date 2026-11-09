"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface RosterFilters {
  search?: string;
  role?: string;
  committee?: string;
  page?: number;
  limit?: number;
}

export interface RosterResponse {
  users: any[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const EMPTY: RosterResponse = { users: [], total: 0, page: 1, limit: 25, pages: 0 };

/**
 * Paginated member roster for the Control Panel's Users table.
 *
 * Returns an empty page rather than throwing when the request fails: the Users section is one
 * of eight, and a failure here should not blank the whole panel.
 */
export default async function fetchRoster(filters: RosterFilters = {}): Promise<RosterResponse> {
  try {
    const cks = await cookies();
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.role) params.set("role", filters.role);
    if (filters.committee) params.set("committee", filters.committee);
    params.set("page", String(filters.page ?? 1));
    params.set("limit", String(filters.limit ?? 25));

    const response = await fetch(`${Config.API_URL}${Config.routes.user.roster}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch roster");

    return {
      users: data.users ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 25,
      pages: data.pages ?? 0,
    };
  } catch (err) {
    Logger.error(`Fetch roster failed: ${(err as Error).message}`);
    return EMPTY;
  }
}
