"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import Topbar from "../../../components/Topbar";
import CareerLanding from "../CareerLanding";
import logoutUser from "../../actions/auth/logoutUser.ts";
import fetchCareerProfile from "../../actions/user/fetchCareerProfile.ts";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from "../../../lib/atoms.ts";

export default function CareerPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [mounted, setMounted] = useState(false);
  const [careerProfile, setCareerProfile] = useState(userProfile || {});

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    (async () => {
      const career = await fetchCareerProfile();
      if (career) {
        setCareerProfile({ ...(userProfile || {}), ...career });
      } else {
        setCareerProfile(userProfile || {});
      }
    })();
  }, [userProfile]);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) return null;

  return (
    <div className="career">
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={adminView}
        onToggleOfficerView={() => setAdminView(v => !v)}
      />
      <CareerLanding profile={careerProfile} />
    </div>
  );
}
