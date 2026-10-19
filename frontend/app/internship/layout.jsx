"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import Topbar from "@/components/Topbar";
import CycleStatusBanner from "@/components/Internship/CycleStatusBanner";
import logoutUser from "@/app/actions/auth/logoutUser";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from "@/lib/atoms";
import "@/components/Internship/style.scss";

export default function InternshipLayout({ children }) {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
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
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        isOfficer={isOfficer}
      />
      <div className="internship-layout">
        <CycleStatusBanner />
        {children}
      </div>
    </>
  );
}
