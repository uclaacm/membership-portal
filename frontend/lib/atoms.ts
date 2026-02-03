"use client";

import { atom } from "jotai";

import type { UserExtendedProfile, UserPublicProfile } from "@/lib/types/User";

export const authUserProfileAtom = atom<UserPublicProfile | UserExtendedProfile | null>(null);
