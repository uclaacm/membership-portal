"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";

import refreshToken from "@/app/actions/auth/refreshToken";

export default async function registerUser(info: any): Promise<boolean> {
  try {
    const cks = await cookies();

    const response = await fetch(Config.API_URL + Config.routes.auth.register, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")}`,
      },
      body: JSON.stringify({ info }),
    });

    const data = await response.json();

    if (!data) throw new Error("Empty response from server");
    if (data.error) throw new Error(data.error.message);

    refreshToken(data.token);
    return true;
  } catch (err) {
    Logger.error(`Register failed: ${(err as Error).message}`);
    return false;
  }
}
