"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenAdmin, isTokenOfficer } from "@/lib/token";
import type {
  InternshipApplication,
  InternshipApplicationsResult,
} from "@/lib/types/Internship";

const APPLICATIONS_PAGE_LIMIT = 100;

export default async function fetchAllApplications(): Promise<InternshipApplicationsResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) {
      return { success: false, error: "Not authenticated" };
    }

    if (!isTokenAdmin(token) && !isTokenOfficer(token)) {
      return { success: false, error: "Not authorized" };
    }

    const url = `${Config.API_URL}${Config.routes.internship.applications}?limit=${APPLICATIONS_PAGE_LIMIT}`;
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

    const applications: InternshipApplication[] = data.data ?? [];
    return { success: true, data: applications };
  } catch (err) {
    Logger.error(`fetchAllApplications failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch applications" };
  }
}
