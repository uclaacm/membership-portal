"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated, isTokenOfficer } from "@/lib/token";
import type { FetchApplicationByIdResult, InternshipApplication } from "@/lib/types/Internship";

export default async function fetchApplicationById(applicationId: string): Promise<FetchApplicationByIdResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };
    if (!isTokenOfficer(token!)) return { success: false, error: "Unauthorized" };

    const response = await fetch(Config.API_URL + Config.routes.internship.applications + "/" + applicationId, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response from server");
    if (data.error) return { success: false, error: data.error.message ?? "Failed to fetch application." };

    return { success: true, data: data.application as InternshipApplication };
  } catch (err) {
    Logger.error(`fetchApplicationById failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch application." };
  }
}
