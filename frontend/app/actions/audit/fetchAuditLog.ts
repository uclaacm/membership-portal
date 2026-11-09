"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface AuditFilters {
  search?: string;
  action?: string;
  range?: string;
  page?: number;
  limit?: number;
}

export interface AuditResponse {
  entries: any[];
  total: number;
  page: number;
  pages: number;
}

const EMPTY: AuditResponse = { entries: [], total: 0, page: 1, pages: 0 };

/**
 * Filterable audit log. Backs both the Audit log section and the Overview activity feed, so it
 * accepts a small `limit` for the latter's seven-row preview.
 */
export default async function fetchAuditLog(filters: AuditFilters = {}): Promise<AuditResponse> {
  try {
    const cks = await cookies();
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.action && filters.action !== "all") params.set("action", filters.action);
    if (filters.range) params.set("range", filters.range);
    params.set("page", String(filters.page ?? 1));
    params.set("limit", String(filters.limit ?? 50));

    const response = await fetch(`${Config.API_URL}${Config.routes.audit}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch audit log");

    return {
      entries: data.entries ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      pages: data.pages ?? 0,
    };
  } catch (err) {
    Logger.error(`Fetch audit log failed: ${(err as Error).message}`);
    return EMPTY;
  }
}
