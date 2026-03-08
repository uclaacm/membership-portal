"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { authUserProfileAtom } from "@/lib/atoms";
import type { UserExtendedProfile } from "@/lib/types/User";

export default function AuthSync({ user }: { user: UserExtendedProfile | null }) {
  const setUserProfile = useSetAtom(authUserProfileAtom);

  useEffect(() => {
    setUserProfile(user);
  }, [user, setUserProfile]);

  return null;
}
