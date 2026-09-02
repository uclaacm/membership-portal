"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSetAtom } from "jotai";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from "@/lib/atoms";
import { isTokenAdmin, isTokenOfficer } from "@/lib/token";
import CookieStore from "@/lib/cookieStore";
import type { UserExtendedProfile } from "@/lib/types/User";

export default function AuthSync({
  user,
  unauthorized = false,
}: {
  user: UserExtendedProfile | null;
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setUserProfile = useSetAtom(authUserProfileAtom);
  const setIsAdmin = useSetAtom(isAdminAtom);
  const setIsOfficer = useSetAtom(isOfficerAtom);
  const setAdminView = useSetAtom(adminViewAtom);
  const setOfficerView = useSetAtom(officerViewAtom);

  // A token the API rejected is dead — clear it and send the user to log in, rather than
  // leaving them on a signed-in-looking page whose every request fails. This is what makes a
  // deploy that rotated the signing secret self-correct instead of needing a manual sign-out.
  //
  // Only 401 triggers this. A 403 means the session is valid but the role lacks permission
  // (an officer opening an admin-only endpoint, say), and logging out on 403 would boot
  // officers out of the portal the moment they touched one.
  useEffect(() => {
    if (!unauthorized) return;
    CookieStore.remove("token");
    // Guard against a redirect loop: once the cookie is gone the next render is a clean
    // logged-out state, and /login itself needs no redirect.
    if (pathname !== "/login") router.replace("/login");
  }, [unauthorized, pathname, router]);

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
