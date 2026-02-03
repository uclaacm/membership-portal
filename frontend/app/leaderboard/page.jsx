'use client';

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import Topbar from '@/components/Topbar';
import Leaderboard from './leaderboard';
import Config from '@/lib/config';
import { authUserProfileAtom } from '@/lib/atoms';
import CookieStore from '@/lib/cookieStore';

export default function LeaderboardPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const loadLeaderboard = async () => {
      try {
        const token = CookieStore.get('token');
        const response = await fetch(Config.API_URL + Config.routes.leaderboard, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Failed to load leaderboard');
      }
    };

    loadLeaderboard();
  }, []);

  const handleLogout = () => {
    window.location.href = Config.API_URL + Config.routes.auth.logout;
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
