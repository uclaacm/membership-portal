"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

/**
 * Upcoming events, soonest first.
 *
 * `limit` exists so the dashboard can request exactly the number of items its fit-to-window
 * maths worked out, rather than over-fetching the whole future calendar and clipping it.
 */
export default async function fetchFutureEvents(limit?: number): Promise<any[]> {
  try {
    const cks = await cookies();
    const query = limit && limit > 0 ? `?limit=${Math.floor(limit)}` : "";

    const response = await fetch(`${Config.API_URL}${Config.routes.events.future}${query}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch events");

    return data.events ?? [];
  } catch (err) {
    Logger.error(`Fetch events failed: ${(err as Error).message}`);
    return [];
  }
}
