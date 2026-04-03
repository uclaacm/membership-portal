'use client';

import { useAtomValue } from 'jotai';
import { authUserProfileAtom } from '@/lib/atoms';
import Topbar from '@/components/Topbar';
import logoutUser from '@/app/actions/auth/logoutUser';
import Resources from './resources';
import './style.scss';

export default function ResourcesPage() {
  const userProfile = useAtomValue(authUserProfileAtom);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="resources">
      <Topbar
        isAdmin={false}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={false}
        adminView={false}
      />
      <Resources />
    </div>
  );
}
