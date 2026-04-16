"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function fetchAdmins(): Promise<any[]> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return [];

    const response = await fetch(Config.API_URL + Config.routes.user.admins, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to fetch admins");

    const order = ["SUPERADMIN", "ADMIN"];
    return (data.admins ?? []).sort((a: any, b: any) => order.indexOf(a.accessType) - order.indexOf(b.accessType));
  } catch (err) {
    Logger.error(`Fetch admins failed: ${(err as Error).message}`);
    return [];
  }
}
