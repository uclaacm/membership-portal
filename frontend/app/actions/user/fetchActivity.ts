"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchActivity(): Promise<any[] | null> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return null;

    const response = await fetch(Config.API_URL + Config.routes.user.activity, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return null;

    return data.activity ?? null;
  } catch (err) {
    Logger.error(`Fetch activity failed: ${(err as Error).message}`);
    return null;
  }
}
