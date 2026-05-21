"use client";

import { useEffect } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { activeCommitteesAtom } from "@/lib/atoms";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import "./CycleStatusBanner.scss";

export default function CycleStatusBanner() {
  const activeCommittees = useAtomValue(activeCommitteesAtom);
  const setActiveCommittees = useSetAtom(activeCommitteesAtom);

  useEffect(() => {
    if (activeCommittees !== null) return;
    fetchAllCommittees().then(result => {
      if (result.success) {
        setActiveCommittees(result.data.filter(c => c.isActive));
      } else {
        setActiveCommittees([]);
      }
    });
  }, [activeCommittees, setActiveCommittees]);

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
