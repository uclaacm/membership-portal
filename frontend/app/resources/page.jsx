'use client';

import { useAtom, useAtomValue } from 'jotai';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from '@/lib/atoms';
import Topbar from '@/components/Topbar';
import logoutUser from '@/app/actions/auth/logoutUser';
import Resources from './resources';
import './style.scss';

export default function ResourcesPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);

  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <div className="resources">
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
      <Resources />
    </div>
  );
}
