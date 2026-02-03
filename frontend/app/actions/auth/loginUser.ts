"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import type { UserPublicProfile } from "@/lib/types/User";

export default async function loginUser(tokenId: string): Promise<UserPublicProfile | undefined> {
  try {
    const response = await fetch(Config.API_URL + Config.routes.auth.login, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tokenId }),
    });

    const data = await response.json();

    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    const cks = await cookies();
    cks.set("token", data.token);

    return data.user as UserPublicProfile;
  } catch (err) {
    Logger.error(`Login failed: ${(err as Error).message}`);
  }

  return undefined;
}
