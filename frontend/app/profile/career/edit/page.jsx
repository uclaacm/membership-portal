'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import CareerProfile from '@/app/profile/CareerProfile';
import logoutUser from '@/app/actions/auth/logoutUser';
import updateCareerProfile from '@/app/actions/user/updateCareerProfile';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from '@/lib/atoms';

export default function CareerEditPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
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
      <CareerProfile
        profile={userProfile || {}}
        updateCareerProfile={updateCareerProfile}
      />
    </div>
  );
}
