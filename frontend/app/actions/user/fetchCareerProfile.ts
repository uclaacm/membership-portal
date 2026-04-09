"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchCareerProfile(): Promise<Record<string, unknown> | null> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return null;

    const response = await fetch(Config.API_URL + Config.routes.user.career, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return null;

    return (data.user as Record<string, unknown>) ?? null;
  } catch (err) {
    Logger.error(`Fetch career profile failed: ${(err as Error).message}`);
    return null;
  }
}
