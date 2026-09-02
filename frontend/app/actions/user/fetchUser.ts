"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";
import type { UserExtendedProfile } from "@/lib/types/User";

export interface UserSession {
  user: UserExtendedProfile | null;
  /**
   * True only when the API actively rejected the token (401) — a signed-out or expired
   * session. Deliberately NOT set for a 403, which means the token is valid but the role
   * lacks permission, nor for a network error, where the session is probably still good.
   */
  unauthorized: boolean;
}

export default async function fetchUser(): Promise<UserSession> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;
    if (!token) return { user: null, unauthorized: false };

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

    // A held token that the API refuses is a dead session — most often because a deploy
    // rotated the signing secret. Surface it so the client can clear it and re-authenticate,
    // instead of rendering a logged-in shell full of empty data.
    if (response.status === 401) return { user: null, unauthorized: true };

    const data = await response.json();
    if (!data || data.error) return { user: null, unauthorized: false };

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

    return {
      user: { ...data.user, ...careerData } as UserExtendedProfile,
      unauthorized: false,
    };
  } catch (err) {
    // A thrown request is a transport problem, not a rejected session — leave the token alone.
    Logger.error(`Fetch user failed: ${(err as Error).message}`);
    return { user: null, unauthorized: false };
  }
}
