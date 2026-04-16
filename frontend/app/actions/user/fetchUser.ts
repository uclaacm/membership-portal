"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import type { UserExtendedProfile } from "@/lib/types/User";

export default async function fetchUser(): Promise<UserExtendedProfile | null> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return null;

    const response = await fetch(Config.API_URL + Config.routes.user.user, {
      cache: "no-store",
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!data || data.error) return null;

    let careerData: Partial<UserExtendedProfile> = {};
    try {
      const careerResponse = await fetch(Config.API_URL + Config.routes.user.career, {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
          Authorization: `Bearer ${token}`,
        },
      });
      const career = await careerResponse.json();
      if (career?.user) careerData = career.user;
    } catch {
      // career profile is optional
    }

    return { ...data.user, ...careerData } as UserExtendedProfile;
  } catch (err) {
    Logger.error(`Fetch user failed: ${(err as Error).message}`);
    return null;
  }
}
