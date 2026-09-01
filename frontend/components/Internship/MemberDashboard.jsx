"use client";

import { useEffect, useRef, useState } from "react";
import { useSetAtom, useAtomValue } from "jotai";
import { myApplicationAtom, activeCommitteesAtom } from "@/lib/atoms";
import fetchOwnApplication from "@/app/actions/internship/fetchOwnApplication";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import ApplicationStatusCard from "./ApplicationStatusCard";
import CommitteeCard from "./CommitteeCard";
import "./style.scss";

export default function MemberDashboard() {
  const setMyApplication = useSetAtom(myApplicationAtom);
  const setActiveCommittees = useSetAtom(activeCommitteesAtom);
  const activeCommittees = useAtomValue(activeCommitteesAtom);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    const loadData = async () => {
      setIsLoading(activeCommittees === null);

      try {
        const applicationPromise = fetchOwnApplication();
        // Always fetch fresh — a committee's active status can change in the
        // admin panel at any time, and activeCommitteesAtom is shared across
        // components/pages, so reusing whatever's already in it risks
        // showing a stale snapshot from earlier in the session.
        const committeesPromise = fetchAllCommittees();

        const [applicationResult, committeesResult] = await Promise.all([
          applicationPromise,
          committeesPromise,
        ]);

        if (applicationResult.success) {
          setMyApplication(applicationResult.data);
        } else if (applicationResult.notFound) {
          setMyApplication(null);
        }

        if (committeesResult.success) {
          const active = committeesResult.data.filter((committee) => committee.isActive);
          setActiveCommittees(active);
        } else {
          setActiveCommittees([]);
        }
      } catch {
        setActiveCommittees([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeCommittees, mounted, setMyApplication, setActiveCommittees]);

  if (!mounted) return null;

  const committees = activeCommittees ?? [];
  const hasActiveCommittees = committees.length > 0;

  return (
    <div className="member-dashboard">
      <div className="member-dashboard__container">
        <div className="member-dashboard__left">
          <ApplicationStatusCard />
        </div>

        <div className="member-dashboard__right">
          <div className="member-dashboard__committee-card">
            <h3 className="member-dashboard__committee-card-title">Available Committees</h3>
            
            {isLoading ? (
              <div className="member-dashboard__loading">Loading committees...</div>
            ) : hasActiveCommittees ? (
              <div className="member-dashboard__committee-grid">
                {committees.map((committee) => (
                  <CommitteeCard key={committee.id} committee={committee} />
                ))}
              </div>
            ) : (
              <div className="member-dashboard__empty-state">
                <p className="member-dashboard__empty-message">
                  Internship recruitment is not currently open. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
