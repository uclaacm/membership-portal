"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function updateCareerProfile(profile: object): Promise<{ success: boolean; error?: string }> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.user.career, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    if (!data || data.error) return { success: false, error: data?.error ?? "Update failed" };

    return { success: true };
  } catch (err) {
    Logger.error(`Update career profile failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message };
  }
}
