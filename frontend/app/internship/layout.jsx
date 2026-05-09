"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import Topbar from "@/components/Topbar";
import CycleStatusBanner from "@/components/Internship/CycleStatusBanner";
import logoutUser from "@/app/actions/auth/logoutUser";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from "@/lib/atoms";

export default function InternshipLayout({ children }) {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) return null;

  return (
    <>
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={officerView}
        onToggleOfficerView={() => setOfficerView(v => !v)}
      />
      <CycleStatusBanner />
      {children}
    </>
  );
}
