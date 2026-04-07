'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import CareerLanding from '@/app/profile/CareerLanding';
import logoutUser from '@/app/actions/auth/logoutUser';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom } from '@/lib/atoms';

export default function CareerPage() {
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
      <CareerLanding profile={userProfile || {}} />
    </div>
  );
}
