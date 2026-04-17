'use client';

import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Leaderboard from './leaderboard';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchLeaderboard from '@/app/actions/leaderboard/fetchLeaderboard';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from '@/lib/atoms';

export default function LeaderboardPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setMounted(true);
      try {
        const leaderboard = await fetchLeaderboard();
        setLeaderboard(leaderboard);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Failed to load leaderboard');
      }
    };

    loadLeaderboard();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="leaderboard">
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
      <Leaderboard
        leaderboard={leaderboard}
        user={userProfile}
        error={error}
        isAdmin={isAdmin && adminView}
      />
    </div>
  );
}
