"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";

import CommitteeGrid from "./CommitteeGrid";
import RankedList from "./RankedList";
import useStep1Save from "./useStep1Save";
import { authUserProfileAtom, committeesAtom, myApplicationAtom } from "@/lib/atoms";
import fetchActiveCommittees from "@/app/actions/internship/fetchActiveCommittees";

export default function Step1Committees({ onValidityChange, flushPendingRef }) {
  const router = useRouter();
  const [committees, setCommittees] = useAtom(committeesAtom);
  const myApplication = useAtomValue(myApplicationAtom);
  const authProfile = useAtomValue(authUserProfileAtom);

  const [loadError, setLoadError] = useState(null);
  const [selectedCommitteeIds, setSelectedCommitteeIds] = useState([]);

  const hasInitializedRef = useRef(false);
  const userTouchedRef = useRef(false);

  const major =
    (authProfile && "major" in authProfile ? authProfile.major : undefined) ?? null;
  const year =
    (authProfile && "year" in authProfile ? authProfile.year : undefined) ?? null;

  const profileComplete = Boolean(
    major && typeof year === "number" && year >= 1 && year <= 5,
  );

  const profileData = profileComplete
    ? {
        university: "UCLA",
        major,
        graduationYear: new Date().getFullYear() + Math.max(0, 5 - year),
      }
    : null;

  const loadCommittees = useCallback(async () => {
    setLoadError(null);
    const result = await fetchActiveCommittees();
    if (result.success) {
      setCommittees(result.data);
    } else {
      setLoadError(result.error || "Failed to load committees");
    }
  }, [setCommittees]);

  useEffect(() => {
    if (committees.length === 0) {
      loadCommittees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (userTouchedRef.current) {
      hasInitializedRef.current = true;
      return;
    }
    if (myApplication) {
      const initial = [
        myApplication.firstChoiceCommittee,
        myApplication.secondChoiceCommittee,
        myApplication.thirdChoiceCommittee,
      ].filter(Boolean);
      setSelectedCommitteeIds(initial);
      hasInitializedRef.current = true;
    }
  }, [myApplication]);

  const { saveState, error, errorKind, flushPending, retry } = useStep1Save(
    selectedCommitteeIds,
    profileData,
  );

  useEffect(() => {
    if (flushPendingRef) flushPendingRef.current = flushPending;
    return () => {
      if (flushPendingRef) flushPendingRef.current = null;
    };
  }, [flushPendingRef, flushPending]);

  useEffect(() => {
    onValidityChange(selectedCommitteeIds.length >= 1);
  }, [selectedCommitteeIds.length, onValidityChange]);

  useEffect(() => {
    if (errorKind === "notFound" || errorKind === "submittedBlock") {
      router.replace("/internship");
    }
  }, [errorKind, router]);

  const handleToggle = useCallback(
    (committeeId) => {
      if (!myApplication?._id && !profileComplete) {
        return;
      }
      userTouchedRef.current = true;
      setSelectedCommitteeIds((prev) => {
        if (prev.includes(committeeId)) {
          return prev.filter((id) => id !== committeeId);
        }
        if (prev.length >= 3) {
          return prev;
        }
        return [...prev, committeeId];
      });
    },
    [myApplication?._id, profileComplete],
  );

  const handleReorder = useCallback((newIds) => {
    userTouchedRef.current = true;
    setSelectedCommitteeIds(newIds);
  }, []);

  const handleRemove = useCallback((committeeId) => {
    userTouchedRef.current = true;
    setSelectedCommitteeIds((prev) => prev.filter((id) => id !== committeeId));
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Select your committees</h2>
      <p className="text-sm text-slate-600">
        Select 1–3 committees in order of preference. They&apos;ll be saved automatically as you go.
      </p>

      {!profileComplete && !myApplication?._id && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Please{" "}
          <Link href="/profile/career/edit" className="font-medium underline">
            complete your profile
          </Link>{" "}
          (major + class year) before starting your application.
        </div>
      )}

      {loadError && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadCommittees} className="text-red-700 underline">
            Retry
          </button>
        </div>
      )}

      <CommitteeGrid selectedCommitteeIds={selectedCommitteeIds} onToggle={handleToggle} />

      <div className="text-xs text-slate-500 text-right">
        {saveState === "pending" && "Saving…"}
        {saveState === "saving" && "Saving…"}
        {saveState === "idle" && myApplication?._id && "Saved"}
        {saveState === "error" && (
          <span className="text-red-600">
            {error || "Save failed"}{" "}
            <button type="button" onClick={retry} className="underline ml-1">
              Retry
            </button>
          </span>
        )}
      </div>

      <RankedList
        selectedCommitteeIds={selectedCommitteeIds}
        onReorder={handleReorder}
        onRemove={handleRemove}
      />
    </section>
  );
}
