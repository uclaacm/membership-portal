"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from "@/lib/atoms";
import { isTokenAdmin, isTokenOfficer } from "@/lib/token";
import CookieStore from "@/lib/cookieStore";
import type { UserExtendedProfile } from "@/lib/types/User";

export default function AuthSync({ user }: { user: UserExtendedProfile | null }) {
  const setUserProfile = useSetAtom(authUserProfileAtom);
  const setIsAdmin = useSetAtom(isAdminAtom);
  const setIsOfficer = useSetAtom(isOfficerAtom);
  const setAdminView = useSetAtom(adminViewAtom);
  const setOfficerView = useSetAtom(officerViewAtom);

  useEffect(() => {
    setUserProfile(user);
    if (user) {
      const token = CookieStore.get("token");
      if (token) {
        const admin = isTokenAdmin(token);
        const officer = isTokenOfficer(token);
        setIsAdmin(admin);
        setIsOfficer(officer);
        // Default to elevated view on login for admins and officers
        setAdminView(admin || officer);
        setOfficerView(officer && !admin);
      }
    } else {
      setIsAdmin(false);
      setIsOfficer(false);
      setAdminView(false);
      setOfficerView(false);
    }
  }, [user, setUserProfile, setIsAdmin, setIsOfficer, setAdminView, setOfficerView]);

  return null;
}
