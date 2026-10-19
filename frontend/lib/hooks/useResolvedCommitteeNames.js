"use client";

import { useEffect, useState } from "react";
import fetchCommitteeById from "@/app/actions/internship/fetchCommitteeById";

// Looks up a committee's display name from an already-loaded (active-only)
// committee list, without requiring a network round trip for the common case.
export function getCommitteeDisplayName(knownCommittees, resolvedNames, committeeId) {
  if (!committeeId) return null;
  const committee = knownCommittees.find(
    (c) => c.id === committeeId || String(c._id) === committeeId,
  );
  if (committee) return committee.displayName;
  return resolvedNames[committeeId] ?? null;
}

// Committee lists elsewhere in the app are filtered to isActive:true, so a
// committee that's since been closed drops out of them. A member's existing
// selections/applications can still reference one, though, so this fetches
// those specific committees by ID (GET /committees/:id has no active-only
// filter) and caches the resolved names.
export default function useResolvedCommitteeNames(committeeIds, knownCommittees) {
  const [resolvedNames, setResolvedNames] = useState({});
  const idsKey = committeeIds.filter(Boolean).join(",");
  const knownKey = knownCommittees.map((c) => c.id ?? c._id).join(",");

  useEffect(() => {
    const missingIds = committeeIds.filter((id) => (
      id
      && !knownCommittees.some((c) => c.id === id || String(c._id) === id)
      && !(id in resolvedNames)
    ));
    if (missingIds.length === 0) return undefined;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missingIds.map(async (id) => {
          const result = await fetchCommitteeById(id);
          return [id, result.success ? result.data.displayName : id];
        }),
      );
      if (cancelled) return;
      setResolvedNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, knownKey]);

  return resolvedNames;
}
