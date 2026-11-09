"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type SubmitApplicationResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string; notFound?: boolean; submittedBlock?: boolean };

export default async function submitApplication(id: string): Promise<SubmitApplicationResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id) + "/submit",
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 404) {
      return { success: false, error: "Application not found", notFound: true };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.error) {
      const msg =
        data?.message ??
        (typeof data?.error === "string" ? data.error : data?.error?.message) ??
        `Failed to submit application (${response.status}).`;

      const isSubmittedBlock =
        (response.status === 400 || response.status === 403 || response.status === 409 || response.status === 422) &&
        typeof msg === "string" &&
        msg.toLowerCase().includes("submitted");

      if (isSubmittedBlock) {
        return { success: false, error: msg, submittedBlock: true };
      }

      return { success: false, error: msg };
    }

    const doc: InternshipApplication | undefined =
      (data?.data as InternshipApplication | undefined) ??
      (data?.application as InternshipApplication | undefined);

    if (!doc) {
      Logger.error("submitApplication failed: missing application in response");
      return { success: false, error: "Failed to submit application." };
    }

    return { success: true, data: doc };
  } catch (err) {
    Logger.error(`submitApplication failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to submit application." };
  }
}
