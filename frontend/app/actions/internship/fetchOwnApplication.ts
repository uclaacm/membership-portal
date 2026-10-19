"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type FetchOwnApplicationResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string; notFound?: boolean };

export default async function fetchOwnApplication(): Promise<FetchOwnApplicationResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.internship.ownApplication, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return { success: false, error: "No application found", notFound: true };
    }

    const data = await response.json();
    if (!data.success) return { success: false, error: data.message ?? "Failed to fetch application." };

    return { success: true, data: data.data as InternshipApplication };
  } catch (err) {
    Logger.error(`fetchOwnApplication failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to fetch application." };
  }
}
