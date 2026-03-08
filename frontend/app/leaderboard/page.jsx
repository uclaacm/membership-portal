'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Leaderboard from './leaderboard';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchLeaderboard from '@/app/actions/leaderboard/fetchLeaderboard';
import { authUserProfileAtom } from '@/lib/atoms';

export default function LeaderboardPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const loadLeaderboard = async () => {
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
        isAdmin={false}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={false}
        adminView={false}
      />
      <Leaderboard 
        leaderboard={leaderboard} 
        user={userProfile} 
        error={error}
        isAdmin={false}
      />
    </div>
  );
}
