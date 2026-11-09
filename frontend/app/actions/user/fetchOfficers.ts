"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

/** Officer roster with committees and position. Admin-only on the API side. */
export default async function fetchOfficers(): Promise<any[]> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.user.officers, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch officers");

    return data.officers ?? [];
  } catch (err) {
    Logger.error(`Fetch officers failed: ${(err as Error).message}`);
    return [];
  }
}
