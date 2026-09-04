"use client";

import { atom } from "jotai";

import type { UserExtendedProfile, UserPublicProfile } from "@/lib/types/User";
import type { InternshipApplication, InternshipCommittee, InternshipQuestionResponse } from "@/lib/types/Internship";

export const authUserProfileAtom = atom<UserPublicProfile | UserExtendedProfile | null>(null);
export const isAdminAtom = atom<boolean>(false);
export const isOfficerAtom = atom<boolean>(false);
export const myApplicationAtom = atom<InternshipApplication | null>(null);
export const officerApplicationsAtom = atom<InternshipApplication[]>([]);1
export const activeCommitteesAtom = atom<InternshipCommittee[] | null>(null);
export const committeesAtom = atom<InternshipCommittee[]>([]);
export const responsesByCommitteeAtom = atom<Record<string, InternshipQuestionResponse[]>>({});
