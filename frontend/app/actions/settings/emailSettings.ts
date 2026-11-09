"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export interface EmailSettings {
  transport: string;
  host?: string | null;
  port?: string | null;
  username?: string | null;
  from?: string | null;
  lastSentAt?: string | null;
  /** Whether a credential is stored. The credential itself is never returned. */
  configured: boolean;
}

const EMPTY: EmailSettings = { transport: "none", configured: false };

export async function fetchEmailSettings(): Promise<EmailSettings> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.settings.email}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${cks.get("token")?.value}` },
      cache: "no-store",
    });
    const data = await response.json();
    if (!data || data.error) throw new Error(data?.error?.message ?? "Failed to load email settings");
    return data.settings ?? EMPTY;
  } catch (err) {
    Logger.error(`fetchEmailSettings failed: ${(err as Error).message}`);
    return EMPTY;
  }
}

/**
 * Writes the transport configuration. Super-admin only on the API side.
 *
 * Omit `token` to keep the stored credential — that is what lets someone change the
 * from-address without having to re-enter a secret they may not have.
 */
export async function updateEmailSettings(
  settings: Partial<EmailSettings> & { token?: string }
): Promise<{ success: boolean; error?: string; settings?: EmailSettings }> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.settings.email}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      body: JSON.stringify(settings),
    });
    const data = await response.json();
    if (!data || data.error) {
      return { success: false, error: data?.error?.message ?? "Failed to save email settings" };
    }
    return { success: true, settings: data.settings };
  } catch (err) {
    Logger.error(`updateEmailSettings failed: ${(err as Error).message}`);
    return { success: false, error: (err as Error).message };
  }
}

export async function sendTestEmail(): Promise<{ sent: boolean; message: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(`${Config.API_URL}${Config.routes.settings.emailTest}`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${cks.get("token")?.value}` },
    });
    const data = await response.json();
    if (!data || data.error) {
      return { sent: false, message: data?.error?.message ?? "Test failed" };
    }
    return { sent: !!data.sent, message: data.message ?? "" };
  } catch (err) {
    Logger.error(`sendTestEmail failed: ${(err as Error).message}`);
    return { sent: false, message: (err as Error).message };
  }
}
