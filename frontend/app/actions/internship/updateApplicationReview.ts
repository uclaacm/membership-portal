"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type UpdateApplicationReviewResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string };

type ReviewField =
  | "firstChoiceOfficer1Rating"
  | "secondChoiceOfficer1Rating"
  | "thirdChoiceOfficer1Rating"
  | "firstChoiceOfficer2Rating"
  | "secondChoiceOfficer2Rating"
  | "thirdChoiceOfficer2Rating"
  | "firstChoiceNotes"
  | "secondChoiceNotes"
  | "thirdChoiceNotes";

export default async function updateApplicationReview(
  id: string,
  reviewField: ReviewField,
  value: string | null,
): Promise<UpdateApplicationReviewResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id) + "/review",
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewField, value }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      const validationMessage = Array.isArray(data?.errors) ? data.errors[0]?.msg : undefined;
      const message =
        validationMessage ?? data?.message ?? `Failed to update review (${response.status}).`;
      Logger.error(`updateApplicationReview failed: ${message}`);
      return { success: false, error: message };
    }

    const doc: InternshipApplication | undefined = data?.data;
    if (!doc) {
      Logger.error("updateApplicationReview failed: missing application in response");
      return { success: false, error: "Failed to update review." };
    }

    return { success: true, data: doc };
  } catch (err) {
    Logger.error(`updateApplicationReview failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update review." };
  }
}
