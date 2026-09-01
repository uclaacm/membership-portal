"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";

import useStep4Save from "./useStep4Save";
import {
  authUserProfileAtom,
  committeesAtom,
  myApplicationAtom,
  responsesByCommitteeAtom,
} from "@/lib/atoms";
import useResolvedCommitteeNames, { getCommitteeDisplayName } from "@/lib/hooks/useResolvedCommitteeNames";
import isValidResumeUrl from "@/components/Internship/ApplicationWizard/isValidResumeUrl";

const MIN_GRADUATION_YEAR = 2020;

function rankLabel(rank) {
  if (rank === 1) return "1st choice";
  if (rank === 2) return "2nd choice";
  if (rank === 3) return "3rd choice";
  return "Choice";
}

function getProfileMajor(profile) {
  return profile && "major" in profile ? profile.major : "";
}

function getProfileYear(profile) {
  return profile && "year" in profile && typeof profile.year === "number" ? profile.year : null;
}

function graduationYearFromProfileYear(year) {
  if (typeof year !== "number" || year < 1 || year > 5) return "";
  return new Date().getFullYear() + Math.max(0, 5 - year);
}

function getSelectedCommitteeIds(app) {
  if (!app) return [];
  return [app.firstChoiceCommittee, app.secondChoiceCommittee, app.thirdChoiceCommittee].filter(Boolean);
}

function getSlotResponses(app, slot) {
  if (!app) return [];
  if (slot === 0) return Array.isArray(app.firstChoiceResponses) ? app.firstChoiceResponses : [];
  if (slot === 1) return Array.isArray(app.secondChoiceResponses) ? app.secondChoiceResponses : [];
  if (slot === 2) return Array.isArray(app.thirdChoiceResponses) ? app.thirdChoiceResponses : [];
  return [];
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "Not provided";
  return value;
}

export default function Step4Review({ onValidityChange, flushPendingRef }) {
  const router = useRouter();
  const myApplication = useAtomValue(myApplicationAtom);
  const authProfile = useAtomValue(authUserProfileAtom);
  const committees = useAtomValue(committeesAtom);
  const responsesByCommittee = useAtomValue(responsesByCommitteeAtom);

  const profileMajor = getProfileMajor(authProfile);
  const profileYear = getProfileYear(authProfile);
  const profileGraduationYear = graduationYearFromProfileYear(profileYear);
  const displayMajor = myApplication?.major || profileMajor;

  const [phone, setPhone] = useState(myApplication?.phone || "");
  const [graduationYearInput, setGraduationYearInput] = useState(
    String(myApplication?.graduationYear || profileGraduationYear || ""),
  );

  const graduationYear = Number(graduationYearInput);
  const graduationYearValid =
    Number.isInteger(graduationYear) && graduationYear >= MIN_GRADUATION_YEAR;
  const resumeUrlValid = isValidResumeUrl(myApplication?.resumeUrl);
  const stepValid = Boolean(myApplication?._id && graduationYearValid && resumeUrlValid);

  useEffect(() => {
    onValidityChange(stepValid);
  }, [stepValid, onValidityChange]);

  const { saveState, error, errorKind, flushPending, retry } = useStep4Save({
    phone,
    graduationYear,
    canSave: stepValid,
  });

  useEffect(() => {
    if (flushPendingRef) flushPendingRef.current = flushPending;
    return () => {
      if (flushPendingRef) flushPendingRef.current = null;
    };
  }, [flushPendingRef, flushPending]);

  useEffect(() => {
    if (errorKind === "notFound" || errorKind === "submittedBlock") {
      router.replace("/internship");
    }
  }, [errorKind, router]);

  const selectedCommitteeIds = useMemo(
    () => getSelectedCommitteeIds(myApplication),
    [myApplication],
  );

  // A committee can close between when it was selected and this review step
  // (e.g. once the cycle ends), dropping it out of `committees`, which is
  // active-only. Resolve those separately so the review still shows a real
  // name instead of falling back to "Committee".
  const resolvedNames = useResolvedCommitteeNames(selectedCommitteeIds, committees);

  const rankedCommittees = useMemo(() => (
    selectedCommitteeIds.map((committeeId, index) => ({
      committeeId,
      rank: index + 1,
      displayName: getCommitteeDisplayName(committees, resolvedNames, committeeId) || "Committee",
      responses: responsesByCommittee[committeeId] || getSlotResponses(myApplication, index),
    }))
  ), [committees, resolvedNames, selectedCommitteeIds, myApplication, responsesByCommittee]);

  const handleGraduationYearChange = useCallback((event) => {
    setGraduationYearInput(event.target.value);
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Review your application</h2>
        <p className="text-sm text-slate-600">
          Check your profile details, committee rankings, responses, and resume link before submitting.
        </p>
      </div>

      <div className="space-y-4 rounded border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">Profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Major</label>
            <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {formatValue(displayMajor)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Profile year</label>
            <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {profileYear ? `Year ${profileYear}` : "Not provided"}
            </div>
          </div>
          <div>
            <label htmlFor="internship-phone" className="block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              id="internship-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div>
            <label htmlFor="internship-graduation-year" className="block text-sm font-medium text-slate-700">
              Graduation year <span className="text-red-600">*</span>
            </label>
            <input
              id="internship-graduation-year"
              type="number"
              min={MIN_GRADUATION_YEAR}
              value={graduationYearInput}
              onChange={handleGraduationYearChange}
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              aria-invalid={!graduationYearValid}
            />
            {!graduationYearValid && (
              <p className="mt-1 text-sm text-red-600">
                Enter a graduation year of {MIN_GRADUATION_YEAR} or later.
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 text-right">
          {saveState === "pending" && "Saving..."}
          {saveState === "saving" && "Saving..."}
          {saveState === "idle" && myApplication?._id && stepValid &&
            `Saved${myApplication.lastModifiedAt ? ` ${new Date(myApplication.lastModifiedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`}
          {saveState === "error" && (
            <span className="text-red-600">
              {error || "Save failed"}{" "}
              <button type="button" onClick={retry} className="underline ml-1">Retry</button>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">Resume</h3>
        {myApplication?.resumeUrl && resumeUrlValid ? (
          <a
            href={myApplication.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-sm text-blue-700 underline"
          >
            {myApplication.resumeUrl}
          </a>
        ) : myApplication?.resumeUrl ? (
          <p className="text-sm text-red-600">Saved resume link must start with http:// or https://.</p>
        ) : (
          <p className="text-sm text-slate-500">No resume link saved.</p>
        )}
      </div>

      <div className="space-y-4 rounded border border-slate-200 p-4">
        <h3 className="text-base font-semibold text-slate-900">Committee applications</h3>
        {rankedCommittees.length === 0 ? (
          <p className="text-sm text-slate-500">No committee selections saved.</p>
        ) : (
          <div className="space-y-5">
            {rankedCommittees.map((committee) => (
              <div key={committee.committeeId} className="space-y-3 border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{rankLabel(committee.rank)}</p>
                  <p className="text-sm text-slate-700">{committee.displayName}</p>
                </div>
                {committee.responses.length === 0 ? (
                  <p className="text-sm italic text-slate-500">No responses saved for this committee.</p>
                ) : (
                  <dl className="space-y-3">
                    {committee.responses.map((response) => (
                      <div key={response.questionKey}>
                        <dt className="text-sm font-medium text-slate-700">{response.question}</dt>
                        <dd className="mt-1 whitespace-pre-wrap rounded bg-slate-50 px-3 py-2 text-sm text-slate-800">
                          {response.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
