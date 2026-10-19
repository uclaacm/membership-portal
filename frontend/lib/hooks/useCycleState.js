'use client';

import { useEffect, useState } from 'react';
import fetchActiveCommittees from '@/app/actions/internship/fetchActiveCommittees';
import { deriveCycleState } from '@/lib/cycleState';

/**
 * Recruitment state for chrome that has no committee data of its own.
 *
 * The topbar renders on every screen, so it cannot rely on the page having already loaded
 * committees. Without this the launcher had no data at all and fell back to its closed
 * variant — it read "Applications closed" while the internship screens showed every committee
 * accepting applications.
 *
 * Returns null until the first response lands, so callers can hold the neutral state rather
 * than briefly asserting "closed".
 */
export default function useCycleState() {
  const [cycle, setCycle] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await fetchActiveCommittees();
      if (!active) return;
      // A failed lookup leaves the state null. Reporting "closed" on a network error is the
      // same wrong assertion this hook exists to remove.
      if (result?.success) setCycle(deriveCycleState(result.data));
    };
    load();
    return () => { active = false; };
  }, []);

  return cycle;
}
