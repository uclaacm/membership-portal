'use client';

import { useAtom, useAtomValue } from 'jotai';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom } from '@/lib/atoms';
import Topbar from '@/components/Topbar';
import logoutUser from '@/app/actions/auth/logoutUser';
import Resources from './resources';
import './style.scss';

export default function ResourcesPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="resources">
      <Topbar
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        isOfficer={isOfficer}
      />
      <Resources />
    </div>
  );
}
