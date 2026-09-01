"use client";

import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import Topbar from "@/components/Topbar";
import CareerLanding from "../CareerLanding";
import logoutUser from "@/app/actions/auth/logoutUser";
import fetchCareerProfile from "@/app/actions/user/fetchCareerProfile";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import { authUserProfileAtom, isAdminAtom, isOfficerAtom, adminViewAtom, activeCommitteesAtom } from "@/lib/atoms";

export default function CareerPage() {
  const userProfile = useAtomValue(authUserProfileAtom);
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [adminView, setAdminView] = useAtom(adminViewAtom);
  const activeCommittees = useAtomValue(activeCommitteesAtom);
  const setActiveCommittees = useSetAtom(activeCommitteesAtom);
  const [mounted, setMounted] = useState(false);
  const hasRequestedCommitteesRef = useRef(false);
  const [careerProfile, setCareerProfile] = useState(userProfile || {});

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!userProfile) return;
    (async () => {
      const career = await fetchCareerProfile();
      if (career) {
        setCareerProfile({ ...(userProfile || {}), ...career });
      } else {
        setCareerProfile(userProfile || {});
      }
    })();
  }, [userProfile]);

  // Guarded to run once per mount — without hasRequestedCommitteesRef, this
  // would loop forever: setActiveCommittees below always produces a new
  // array, which re-triggers this effect since activeCommittees is a dep.
  useEffect(() => {
    if (hasRequestedCommitteesRef.current) return;
    hasRequestedCommitteesRef.current = true;

    fetchAllCommittees().then(result => {
      if (result.success) {
        setActiveCommittees(result.data.filter(c => c.isActive));
      } else {
        setActiveCommittees([]);
      }
    });
  }, [setActiveCommittees]);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (!mounted) return null;

  return (
    <div className="career">
      <Topbar
        isAdmin={adminView}
        picture={userProfile?.picture}
        onLogout={handleLogout}
        isRealAdmin={isAdmin}
        adminView={adminView}
        onToggleAdminView={() => setAdminView(v => !v)}
        isOfficer={isOfficer}
        officerView={false}
        onToggleOfficerView={() => {}}
      />
      <CareerLanding
        profile={careerProfile}
        isInternshipOpen={activeCommittees === null ? null : activeCommittees.length > 0}
      />
    </div>
  );
}
