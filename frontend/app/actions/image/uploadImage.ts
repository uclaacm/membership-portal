"use server";

import { cookies } from "next/headers";
import Config from "@/lib/config";
import Logger from "@/lib/logger";

export default async function uploadImage(formData: FormData): Promise<{ success: boolean; uuid?: string; error?: string }> {
  try {
    const cks = await cookies();
    const response = await fetch(Config.API_URL + Config.routes.image.upload, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cks.get("token")?.value}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!data) throw new Error("Empty response");
    if (data.error) return { success: false, error: data.error.message ?? data.error };

    return { success: true, uuid: data.uuid };
  } catch (err) {
    Logger.error(`uploadImage failed: ${(err as Error).message}`);
    return { success: false, error: "Image upload failed." };
  }
}
