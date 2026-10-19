"use server";

import { cookies } from "next/headers";

import Config from "@/lib/config";
import Logger from "@/lib/logger";
import { isAuthenticated } from "@/lib/token";
import type { InternshipApplication } from "@/lib/types/Internship";

type CreateApplicationDraftResult =
  | { success: true; data: InternshipApplication }
  | { success: false; error: string };

export default async function createApplicationDraft(input: {
  firstChoiceCommittee: string;
  university: string;
  major: string;
  graduationYear: number;
}): Promise<CreateApplicationDraftResult> {
  try {
    const cks = await cookies();
    const token = cks.get("token")?.value;

    if (!isAuthenticated(token)) return { success: false, error: "Not authenticated" };

    const response = await fetch(Config.API_URL + Config.routes.internship.applications, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstChoiceCommittee: input.firstChoiceCommittee,
        university: input.university,
        major: input.major,
        graduationYear: input.graduationYear,
      }),
    });

    const data = await response.json();

    if (!response.ok || data?.error) {
      const msg =
        data?.message ??
        (typeof data?.error === "string" ? data.error : data?.error?.message) ??
        `Failed to create application draft (${response.status}).`;
      return { success: false, error: msg };
    }

    const doc: InternshipApplication | undefined =
      (data?.data as InternshipApplication | undefined) ??
      (data?.application as InternshipApplication | undefined);

    if (!doc) {
      Logger.error("createApplicationDraft failed: missing application in response");
      return { success: false, error: "Failed to create application draft." };
    }

    return { success: true, data: doc };
  } catch (err) {
    Logger.error(`createApplicationDraft failed: ${(err as Error).message}`);
    return { success: false, error: "Failed to create application draft." };
  }
}
