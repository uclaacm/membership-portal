"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function syncEvents(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    // Sheets sync endpoint: POST /api/v1/sheets/event
    const response = await fetch(`${Config.API_URL}/api/v1/sheets/event`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        return { success: false, error: `Request failed (${response.status})` };
      }
    }

    if (!response.ok) {
      const msg = data?.error?.message ?? data?.error ?? `Request failed (${response.status})`;
      return { success: false, error: msg };
    }

    if (data?.error) {
      return { success: false, error: data.error.message ?? data.error };
    }

    return { success: data?.success ?? true, message: data?.message };
  } catch (err) {
    Logger.error(`syncEvents failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to sync events." };
  }
}
