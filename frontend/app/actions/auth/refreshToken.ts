"use server";

import { cookies } from "next/headers";

export default async function refreshToken(token: string): Promise<void> {
  const cks = await cookies();
  cks.set("token", token);
}
