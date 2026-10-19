"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function logoutUser(): Promise<void> {
  const cks = await cookies();
  cks.delete("token");
  redirect("/login");
}
