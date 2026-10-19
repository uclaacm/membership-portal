"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function deleteImage(uuid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { success: false, error: "Not authenticated" };

    const response = await fetch(`${Config.API_URL + Config.routes.image.specific}/${uuid}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return { success: false, error: data?.error?.message ?? data?.error ?? "Delete failed" };

    return { success: true };
  } catch (err) {
    Logger.error(`Delete image failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message };
  }
}
