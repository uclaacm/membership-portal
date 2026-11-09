"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type StatusField = "firstChoiceStatus" | "secondChoiceStatus" | "thirdChoiceStatus";

type UpdateApplicationStatusResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string };

export default async function updateApplicationStatus(
  id: string,
  statusField: StatusField,
  status: string,
): Promise<UpdateApplicationStatusResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(
      Config.API_URL + Config.routes.internship.applications + "/" + encodeURIComponent(id) + "/status",
      {
        method: "PUT",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusField, status }),
      },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.success === false) {
      const validationMessage = Array.isArray(data?.errors) ? data.errors[0]?.msg : undefined;
      const message =
        validationMessage ?? data?.message ?? `Failed to update status (${response.status}).`;
      Logger.error(`updateApplicationStatus failed: ${message}`);
      return { success: false, error: message };
    }

    const doc: InternshipApplication | undefined = data?.data;
    if (!doc) {
      Logger.error("updateApplicationStatus failed: missing application in response");
      return { success: false, error: "Failed to update status." };
    }

    return { success: true, data: doc };
  } catch (err) {
    Logger.error(`updateApplicationStatus failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to update status." };
  }
}
