"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenAdmin, isTokenOfficer } from "@/lib/token";
import type {
  FetchApplicationsOptions,
  InternshipApplicationsListResult,
} from "@/lib/types/Internship";

const DEFAULT_LIMIT = 25;

export default async function fetchAllApplications(
  options: FetchApplicationsOptions = {},
): Promise<InternshipApplicationsListResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) {
      return { success: false, error: "Not authenticated" };
    }

    if (!isTokenAdmin(token) && !isTokenOfficer(token)) {
      return { success: false, error: "Not authorized" };
    }

    const params = new URLSearchParams();
    params.set("page", String(options.page ?? 1));
    params.set("limit", String(options.limit ?? DEFAULT_LIMIT));
    if (options.search) params.set("search", options.search);
    // status/committeeId match "any of the application's 3 choice slots",
    // not a specific slot — see the backend's getAllApplications for why
    // this can't be done by setting firstChoiceStatus/etc. to the same value.
    if (options.status) params.set("status", options.status);
    if (options.committeeId) params.set("committeeId", options.committeeId);
    if (options.choiceRank) params.set("choiceRank", options.choiceRank);
    if (options.applicationCycle) params.set("applicationCycle", options.applicationCycle);
    if (options.archived) params.set("archived", "true");
    if (options.includeDrafts) params.set("includeDrafts", "true");

    const url = `${Config.API_URL}${Config.routes.internship.applications}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.success === false) {
      const validationMessage = Array.isArray(data?.errors) ? data.errors[0]?.msg : undefined;
      const message =
        validationMessage ?? data?.message ?? data?.error ?? "Failed to fetch applications";
      Logger.error(`fetchAllApplications failed: ${message}`);
      return { success: false, error: message };
    }

    return {
      success: true,
      data: data.data ?? [],
      pagination: data.pagination ?? { page: 1, limit: DEFAULT_LIMIT, total: 0, pages: 0 },
    };
  } catch (err) {
    Logger.error(`fetchAllApplications failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch applications" };
  }
}
