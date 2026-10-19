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
      body: JSON.stringify({ user: profile }),
    });
    const { status } = response;

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // ignore JSON parse errors; we'll fall back to generic messages
    }

    if (!response.ok) {
      const validationMessage = Array.isArray(data?.errors) && data.errors.length > 0 ? data.errors[0]?.msg : undefined;
      const errorMessage =
        data?.error?.message || data?.message || validationMessage || `Update failed with status ${status}`;
      return { success: false, error: errorMessage };
    }

    if (data?.error) {
      const errVal = data.error;
      const msg = typeof errVal === "string" ? errVal : errVal?.message;
      return { success: false, error: msg ?? "Update failed" };
    }

    return { success: true };
  } catch (err) {
    Logger.error(`Update career profile failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message };
  }
}
