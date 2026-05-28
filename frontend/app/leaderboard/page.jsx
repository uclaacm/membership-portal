'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useSearchParams } from 'next/navigation';
import Topbar from '@/components/Topbar';
import Leaderboard from './leaderboard';
import AdminFilterBar from './AdminFilterBar';
import logoutUser from '@/app/actions/auth/logoutUser';
import fetchLeaderboard from '@/app/actions/leaderboard/fetchLeaderboard';
import fetchAdminLeaderboard from '@/app/actions/leaderboard/fetchAdminLeaderboard';
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, officerViewAtom } from '@/lib/atoms';

// Wrapped in Suspense because useSearchParams() requires it in Next.js App Router.
function LeaderboardPageInner() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const [officerView, setOfficerView] = useAtom(officerViewAtom);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  // Both admins and officers use the same adminView toggle — the backend and
  // AdminFilterBar handle permission differences (which filters are visible).
  const showAdminView = (isAdmin || isOfficer) && adminView;

  useEffect(() => {
    const loadLeaderboard = async () => {
      setMounted(true);
      try {
        if (showAdminView) {
          const filters = {};
          const year = searchParams.get('year');
          const role = searchParams.get('role');
          const committee = searchParams.get('committee');
          if (year) filters.year = year;
          if (role) filters.role = role;
          if (committee) filters.committee = committee;
          const result = await fetchAdminLeaderboard(filters);
          setLeaderboard(result.leaderboard);
        } else {
          const result = await fetchLeaderboard();
          setLeaderboard(result);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Failed to load leaderboard');
      }
    };

    loadLeaderboard();
  // Re-fetches when the view mode toggles or any filter param changes in the URL.
  }, [showAdminView, searchParams]);

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
        showAdminView={showAdminView}
        filterBar={showAdminView ? <AdminFilterBar isAdmin={isAdmin} /> : null}
      />
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense>
      <LeaderboardPageInner />
    </Suspense>
  );
}
