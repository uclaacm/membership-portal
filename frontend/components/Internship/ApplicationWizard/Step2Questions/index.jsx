"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import CommitteeTabBar from "./CommitteeTabBar";
import QuestionForm from "./QuestionForm";
import useStep2Save from "./useStep2Save";
import { committeesAtom, myApplicationAtom, responsesByCommitteeAtom } from "@/lib/atoms";

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

function isAnswered(value) {
  return typeof value === "string" && value.trim() !== "";
}

export default function Step2Questions({ onValidityChange, flushPendingRef }) {
  const myApplication = useAtomValue(myApplicationAtom);
  const committees = useAtomValue(committeesAtom);
  const [responsesByCommittee, setResponsesByCommittee] = useAtom(responsesByCommitteeAtom);

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const hydratedRef = useRef(false);

  const selectedCommitteeIds = useMemo(() => getSelectedCommitteeIds(myApplication), [myApplication]);

  useEffect(() => {
    if (hydratedRef.current) return;
    if (!myApplication) return;
    const ids = getSelectedCommitteeIds(myApplication);
    if (ids.length === 0) return;
    setResponsesByCommittee((prev) => {
      const next = { ...prev };
      ids.forEach((id, slot) => {
        if (!next[id] || next[id].length === 0) {
          next[id] = getSlotResponses(myApplication, slot);
        }
      });
      return next;
    });
    hydratedRef.current = true;
  }, [myApplication, setResponsesByCommittee]);

  const safeActiveTabIndex =
    activeTabIndex >= selectedCommitteeIds.length && selectedCommitteeIds.length > 0
      ? 0
      : activeTabIndex;

  const committeeById = useMemo(() => {
    const map = new Map();
    committees.forEach((c) => { map.set(c.id, c); });
    return map;
  }, [committees]);

  const isTabIncomplete = useCallback((committeeId) => {
    const committee = committeeById.get(committeeId);
    if (!committee || !Array.isArray(committee.customQuestions)) return false;
    const responses = responsesByCommittee[committeeId] || [];
    const answerByKey = new Map(responses.map((r) => [r.questionKey, r.answer]));
    return committee.customQuestions.some((q) => q.required && !isAnswered(answerByKey.get(q.questionKey)));
  }, [committeeById, responsesByCommittee]);

  const tabs = useMemo(() => selectedCommitteeIds.map((id, idx) => {
    const committee = committeeById.get(id);
    return {
      committeeId: id,
      displayName: committee?.displayName ?? "Committee",
      rank: idx + 1,
      incomplete: isTabIncomplete(id),
    };
  }), [selectedCommitteeIds, committeeById, isTabIncomplete]);

  const step2Valid = useMemo(() => {
    if (selectedCommitteeIds.length === 0) return false;
    return selectedCommitteeIds.every((id) => !isTabIncomplete(id));
  }, [selectedCommitteeIds, isTabIncomplete]);

  useEffect(() => {
    onValidityChange(step2Valid);
  }, [step2Valid, onValidityChange]);

  const { saveState, error, errorKind, flushPending, retry } = useStep2Save(selectedCommitteeIds);

  useEffect(() => {
    if (flushPendingRef) flushPendingRef.current = flushPending;
    return () => {
      if (flushPendingRef) flushPendingRef.current = null;
    };
  }, [flushPendingRef, flushPending]);

  const activeCommitteeId = selectedCommitteeIds[safeActiveTabIndex];
  const activeCommittee = activeCommitteeId ? committeeById.get(activeCommitteeId) : null;
  const activeQuestions = activeCommittee?.customQuestions ?? [];
  const activeResponses = activeCommitteeId ? (responsesByCommittee[activeCommitteeId] || []) : [];

  const handleAnswerChange = useCallback((questionKey, answer) => {
    if (!activeCommitteeId) return;
    setResponsesByCommittee((prev) => {
      const current = prev[activeCommitteeId] || [];
      const activeCommitteeData = committeeById.get(activeCommitteeId);
      const question = activeCommitteeData?.customQuestions?.find((q) => q.questionKey === questionKey);
      const questionText = question?.questionText ?? "";
      const idx = current.findIndex((r) => r.questionKey === questionKey);
      let nextArr;
      if (idx === -1) {
        nextArr = [...current, { questionKey, question: questionText, answer }];
      } else {
        nextArr = current.map((r, i) => (i === idx ? { ...r, answer } : r));
      }
      return { ...prev, [activeCommitteeId]: nextArr };
    });
  }, [activeCommitteeId, committeeById, setResponsesByCommittee]);

  if (selectedCommitteeIds.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Application questions</h2>
        <p className="text-sm text-slate-600">Select at least one committee in Step 1 before answering questions.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Application questions</h2>
        <p className="text-sm text-slate-600">Required questions are marked with a red asterisk.</p>
      </div>

      <CommitteeTabBar tabs={tabs} activeIndex={safeActiveTabIndex} onChange={setActiveTabIndex} />

      {activeCommittee && (
        <QuestionForm
          questions={activeQuestions}
          responses={activeResponses}
          onAnswerChange={handleAnswerChange}
        />
      )}

      <div className="text-xs text-slate-500 text-right">
        {saveState === "pending" && "Saving…"}
        {saveState === "saving" && "Saving…"}
        {saveState === "idle" && myApplication?._id &&
          `Saved${myApplication.lastModifiedAt ? ` ${new Date(myApplication.lastModifiedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`}
        {saveState === "error" && (
          <span className="text-red-600">
            {error || "Save failed"}{" "}
            <button type="button" onClick={retry} className="underline ml-1">Retry</button>
          </span>
        )}
      </div>
    </section>
  );
}
