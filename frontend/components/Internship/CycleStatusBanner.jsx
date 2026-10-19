"use client";

import { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { activeCommitteesAtom } from "@/lib/atoms";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import "./CycleStatusBanner.scss";

export default function CycleStatusBanner() {
  const activeCommittees = useAtomValue(activeCommitteesAtom);
  const setActiveCommittees = useSetAtom(activeCommitteesAtom);
  const hasRequestedRef = useRef(false);

  // Always fetch fresh on mount rather than skipping when activeCommitteesAtom
  // is already populated — it's shared across components/pages, so treating
  // it as "already loaded" risks showing a stale snapshot from earlier in
  // the session (e.g. after an admin opens/closes committees elsewhere).
  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    let cancelled = false;
    fetchAllCommittees()
      .then(result => {
        if (cancelled) return;
        if (result.success) {
          setActiveCommittees(result.data.filter(c => c.isActive));
        } else {
          setActiveCommittees([]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setActiveCommittees([]);
      });

    return () => {
      cancelled = true;
    };
  }, [setActiveCommittees]);

  if (activeCommittees === null) return null;

  const isOpen = activeCommittees.length > 0;

  return (
    <div className={`cycle-status-banner cycle-status-banner--${isOpen ? "open" : "closed"}`}>
      <span className="cycle-status-banner__dot" />
      <span className="cycle-status-banner__text">
        {isOpen
          ? `Internship recruitment is open — ${activeCommittees.length} committee${activeCommittees.length !== 1 ? "s" : ""} accepting applications`
          : "Internship recruitment is currently closed"}
      </span>
    </div>
  );
}
