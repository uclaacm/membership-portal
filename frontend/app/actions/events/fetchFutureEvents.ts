"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchFutureEvents(): Promise<any[]> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.events.future, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch events");

    return data.events ?? [];
  } catch (err) {
    Logger.error(`Fetch events failed: ${(err as Error).message}`);
    return [];
  }
}
