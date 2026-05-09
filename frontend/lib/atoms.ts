"use client";

import { atom } from "jotai";

import type { UserExtendedProfile, UserPublicProfile } from "@/lib/types/User";
import type { InternshipApplication } from "@/lib/types/Internship";

export const authUserProfileAtom = atom<UserPublicProfile | UserExtendedProfile | null>(null);
export const isAdminAtom = atom<boolean>(false);
export const isOfficerAtom = atom<boolean>(false);
export const adminViewAtom = atom<boolean>(false);
export const officerViewAtom = atom<boolean>(false);
export const myApplicationAtom = atom<InternshipApplication | null>(null);
