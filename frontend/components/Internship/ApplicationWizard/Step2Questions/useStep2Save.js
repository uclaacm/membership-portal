"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import updateApplication from "@/app/actions/internship/updateApplication";
import { myApplicationAtom, responsesByCommitteeAtom } from "@/lib/atoms";

const DEBOUNCE_MS = 500;

function cleanResponses(responsesArr) {
  if (!Array.isArray(responsesArr)) return [];
  return responsesArr
    .filter((r) => r && typeof r.answer === "string" && r.answer.trim() !== "")
    .map((r) => ({ questionKey: r.questionKey, question: r.question, answer: r.answer }));
}

function buildBody(selectedCommitteeIds, responsesMap) {
  const [first, second, third] = selectedCommitteeIds;
  const firstResponses = first ? (responsesMap[first] || []) : [];
  const secondResponses = second ? (responsesMap[second] || []) : [];
  const thirdResponses = third ? (responsesMap[third] || []) : [];
  return {
    firstChoiceResponses: cleanResponses(firstResponses),
    secondChoiceResponses: cleanResponses(secondResponses),
    thirdChoiceResponses: cleanResponses(thirdResponses),
  };
}

function slotKey(responsesArr) {
  return cleanResponses(responsesArr)
    .map((r) => `${r.questionKey}=${r.answer}`)
    .sort()
    .join("|");
}

function persistedMatchesCurrent(app, selectedCommitteeIds, responsesMap) {
  const [first, second, third] = selectedCommitteeIds;
  const current = [
    slotKey(first ? (responsesMap[first] || []) : []),
    slotKey(second ? (responsesMap[second] || []) : []),
    slotKey(third ? (responsesMap[third] || []) : []),
  ];
  const persisted = [
    slotKey(app.firstChoiceResponses || []),
    slotKey(app.secondChoiceResponses || []),
    slotKey(app.thirdChoiceResponses || []),
  ];
  return current.every((c, i) => c === persisted[i]);
}

export default function useStep2Save(selectedCommitteeIds) {
  const [myApplication, setMyApplication] = useAtom(myApplicationAtom);
  const [responsesByCommittee] = useAtom(responsesByCommitteeAtom);
  const [saveState, setSaveState] = useState("idle");
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);

  const timerRef = useRef(null);
  const inFlightRef = useRef(null);
  const latestIdsRef = useRef(selectedCommitteeIds);
  const responsesMapRef = useRef(responsesByCommittee);
  const appRef = useRef(myApplication);
  const saveStateRef = useRef(saveState);
  const errorRef = useRef(error);

  useEffect(() => {
    latestIdsRef.current = selectedCommitteeIds;
  }, [selectedCommitteeIds]);

  useEffect(() => {
    responsesMapRef.current = responsesByCommittee;
  }, [responsesByCommittee]);

  useEffect(() => {
    appRef.current = myApplication;
  }, [myApplication]);

  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const doSave = useCallback(async () => {
    const ids = latestIdsRef.current;
    const map = responsesMapRef.current;
    const app = appRef.current;

    if (!app || !app._id) {
      setSaveState("idle");
      return;
    }
    if (!ids || ids.length === 0) {
      setSaveState("idle");
      return;
    }

    setSaveState("saving");
    setError(null);
    setErrorKind(null);

    try {
      const payload = buildBody(ids, map);
      const result = await updateApplication(app._id, payload);
      if (!result.success) {
        if (result.notFound) {
          setError("Application not found");
          setErrorKind("notFound");
        } else if (result.submittedBlock) {
          setError("Application already submitted");
          setErrorKind("submittedBlock");
        } else {
          setError(result.error || "Save failed");
          setErrorKind("network");
        }
        setSaveState("error");
        return;
      }
      setMyApplication(result.data);
      appRef.current = result.data;
      setSaveState("idle");
      setErrorKind(null);
    } catch (err) {
      setError((err && err.message) || "Save failed");
      setSaveState("error");
      setErrorKind("network");
    }
  }, [setMyApplication]);

  const runSave = useCallback(async () => {
    if (inFlightRef.current) {
      try {
        await inFlightRef.current;
      } catch {
        /* empty */
      }
    }
    const p = doSave();
    inFlightRef.current = p;
    try {
      await p;
    } finally {
      if (inFlightRef.current === p) inFlightRef.current = null;
    }
  }, [doSave]);

  useEffect(() => {
    const app = appRef.current;
    if (!app || !app._id) {
      setSaveState("idle");
      return undefined;
    }
    if (!selectedCommitteeIds || selectedCommitteeIds.length === 0) {
      setSaveState("idle");
      return undefined;
    }
    if (persistedMatchesCurrent(app, selectedCommitteeIds, responsesByCommittee)) {
      setSaveState("idle");
      return undefined;
    }
    setSaveState("pending");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      runSave();
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [responsesByCommittee, selectedCommitteeIds, runSave]);

  const flushPending = useCallback(async () => {
    if (!appRef.current || !appRef.current._id) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      await runSave();
    } else if (inFlightRef.current) {
      try {
        await inFlightRef.current;
      } catch {
        /* empty */
      }
    }
    if (saveStateRef.current === "error") {
      throw new Error(errorRef.current || "Save failed");
    }
  }, [runSave]);

  const retry = useCallback(() => {
    setError(null);
    setErrorKind(null);
    setSaveState("pending");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      runSave();
    }, 0);
  }, [runSave]);

  return { saveState, error, errorKind, flushPending, retry };
}
