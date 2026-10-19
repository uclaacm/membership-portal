"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface RoleChange {
  uuid?: string;
  email?: string;
  role: "Member" | "Officer" | "Admin";
  committees?: string[];
  position?: string;
}

export interface RoleChangeResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Resolves an email to a user uuid via the roster search.
 *
 * The role endpoint is uuid-keyed, but the assign dialog collects an email. Matching is exact
 * and case-insensitive: the search endpoint does a substring match, so "sam@" would otherwise
 * be able to promote whichever partial match happened to sort first.
 */
async function resolveUuidByEmail(email: string, token: string | undefined): Promise<string | null> {
  const params = new URLSearchParams({ search: email, limit: "25" });
  const response = await fetch(`${Config.API_URL}${Config.routes.user.roster}?${params.toString()}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await response.json();
  if (!data || data.error) return null;

  const target = email.trim().toLowerCase();
  const match = (data.users ?? []).find((u: any) => String(u.email).toLowerCase() === target);
  return match ? match.uuid : null;
}

/** Grants or revokes an elevated role. Every call is audited server-side. */
export default async function updateUserRole(change: RoleChange): Promise<RoleChangeResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    let { uuid } = change;
    if (!uuid) {
      if (!change.email) return { success: false, error: "A user uuid or email is required." };
      uuid = (await resolveUuidByEmail(change.email, token)) ?? undefined;
      if (!uuid) return { success: false, error: `No user found with email ${change.email}.` };
    }

    const response = await fetch(`${Config.API_URL}${Config.routes.user.role}/${uuid}/role`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: change.role,
        committees: change.committees,
        position: change.position,
      }),
    });

    const data = await response.json();
    if (!data || data.error) {
      return { success: false, error: data?.error?.message ?? "Failed to update role" };
    }

    return { success: true, user: data.user };
  } catch (err) {
    Logger.error(`Update user role failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message };
  }
}
