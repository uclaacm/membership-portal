"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";

type DeleteApplicationResult =
  | { success: true }
  | { success: false; error: string };

export default async function deleteApplication(id: string): Promise<DeleteApplicationResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id),
      {
        method: "DELETE",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      const msg = data?.message ?? `Failed to delete application (${response.status}).`;
      Logger.error(`deleteApplication failed: ${msg}`);
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (err) {
    Logger.error(`deleteApplication failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to delete application." };
  }
}
