"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import Topbar from "../../../../components/Topbar";
import CareerProfile from "../../CareerProfile.jsx";
import logoutUser from "../../../actions/auth/logoutUser";
import updateCareerProfile from "../../../actions/user/updateCareerProfile";
import fetchCareerProfile from "../../../actions/user/fetchCareerProfile";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from "../../../../lib/atoms";

export default function CareerEditPage() {
  const router = useRouter();
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [mounted, setMounted] = useState(false);
  const [careerProfile, setCareerProfile] = useState(userProfile || {});

  useEffect(() => {
    setMounted(true);
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

  const handleUpdateCareerProfile = async (profile) => {
    const token = CookieStore.get('token');
    const response = await fetch(Config.API_URL + Config.routes.user.career, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user: profile }),
    });
    const data = await response.json();
    if (!data || data.error) return { success: false, error: data?.error?.message ?? data?.error ?? 'Update failed' };
    return { success: true };
  };

  if (!mounted) return null;

  return (
    <div>
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
      <CareerProfile profile={careerProfile} updateCareerProfile={updateCareerProfile} />
    </div>
  );
}
