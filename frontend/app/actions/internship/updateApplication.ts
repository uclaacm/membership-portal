"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type UpdateApplicationResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string; notFound?: boolean; submittedBlock?: boolean };

export default async function updateApplication(
  id: string,
  patch: {
    firstChoiceCommittee?: string;
    secondChoiceCommittee?: string | null;
    thirdChoiceCommittee?: string | null;
    phone?: string;
    major?: string;
    graduationYear?: number;
    firstChoiceResponses?: { questionKey: string; question: string; answer: string }[];
    secondChoiceResponses?: { questionKey: string; question: string; answer: string }[];
    thirdChoiceResponses?: { questionKey: string; question: string; answer: string }[];
    resumeUrl?: string;
    coverLetter?: string;
  },
): Promise<UpdateApplicationResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id),
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
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
        `Failed to update application (${response.status}).`;

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
      Logger.error("updateApplication failed: missing application in response");
      return { success: false, error: "Failed to update application." };
    }

    return { success: true, data: doc };
  } catch (err) {
    Logger.error(`updateApplication failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update application." };
  }
}
