"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import createApplicationDraft from "@/app/actions/internship/createApplicationDraft";
import updateApplication from "@/app/actions/internship/updateApplication";
import deleteApplication from "@/app/actions/internship/deleteApplication";
import { myApplicationAtom, responsesByCommitteeAtom } from "@/lib/atoms";

const DEBOUNCE_MS = 500;

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

function cleanResponses(responses) {
  if (!Array.isArray(responses)) return [];
  return responses
    .filter((r) => r && typeof r.answer === "string" && r.answer.trim() !== "")
    .map((r) => ({ questionKey: r.questionKey, question: r.question, answer: r.answer }));
}

function buildResponsesByCommittee(app, responsesMap) {
  const merged = {};
  getSelectedCommitteeIds(app).forEach((committeeId, slot) => {
    merged[committeeId] = cleanResponses(getSlotResponses(app, slot));
  });

  Object.entries(responsesMap || {}).forEach(([committeeId, responses]) => {
    merged[committeeId] = cleanResponses(responses);
  });

  return merged;
}

function buildBody(ids, responsesMap, app = null) {
  const [first, second, third] = ids;
  const responsesByCommittee = buildResponsesByCommittee(app, responsesMap);

  const body = {
    firstChoiceCommittee: first,
    secondChoiceCommittee: second ?? null,
    thirdChoiceCommittee: third ?? null,
    firstChoiceResponses: first ? (responsesByCommittee[first] || []) : [],
    secondChoiceResponses: second ? (responsesByCommittee[second] || []) : [],
    thirdChoiceResponses: third ? (responsesByCommittee[third] || []) : [],
  };

  return body;
}

export default function useStep1Save(selectedCommitteeIds, profileData) {
  const [myApplication, setMyApplication] = useAtom(myApplicationAtom);
  const [responsesByCommittee] = useAtom(responsesByCommitteeAtom);
  const [saveState, setSaveState] = useState("idle");
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);

  const timerRef = useRef(null);
  const inFlightRef = useRef(null);
  const latestIdsRef = useRef(selectedCommitteeIds);
  const appRef = useRef(myApplication);
  const profileDataRef = useRef(profileData);
  const saveStateRef = useRef(saveState);
  const errorRef = useRef(error);
  const responsesByCommitteeRef = useRef(responsesByCommittee);
  const hasEverSelectedRef = useRef(selectedCommitteeIds.length > 0);

  useEffect(() => {
    latestIdsRef.current = selectedCommitteeIds;
  }, [selectedCommitteeIds]);

  useEffect(() => {
    appRef.current = myApplication;
  }, [myApplication]);

  useEffect(() => {
    profileDataRef.current = profileData;
  }, [profileData]);

  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  useEffect(() => {
    responsesByCommitteeRef.current = responsesByCommittee;
  }, [responsesByCommittee]);

  const doSave = useCallback(async () => {
    const ids = latestIdsRef.current;
    const app = appRef.current;

    if (ids.length === 0) {
      if (!app || !app._id) {
        setSaveState("idle");
        setError(null);
        setErrorKind(null);
        return;
      }
      setSaveState("saving");
      setError(null);
      setErrorKind(null);
      try {
        const result = await deleteApplication(app._id);
        if (!result.success) {
          setError(result.error || "Couldn't clear application");
          setSaveState("error");
          setErrorKind("network");
          return;
        }
        setMyApplication(null);
        appRef.current = null;
        setSaveState("idle");
        setErrorKind(null);
      } catch (err) {
        setError((err && err.message) || "Couldn't clear application");
        setSaveState("error");
        setErrorKind("network");
      }
      return;
    }

    setSaveState("saving");
    setError(null);
    setErrorKind(null);

    try {
      const payload = buildBody(ids, responsesByCommitteeRef.current, app);
      if (!app || !app._id) {
        const pd = profileDataRef.current;
        if (!pd || !pd.university || !pd.major || typeof pd.graduationYear !== "number") {
          setError("Profile incomplete — cannot create draft");
          setSaveState("error");
          setErrorKind("profileIncomplete");
          return;
        }
        const result = await createApplicationDraft({
          firstChoiceCommittee: ids[0],
          university: pd.university,
          major: pd.major,
          graduationYear: pd.graduationYear,
        });
        if (!result.success) {
          setError(result.error || "Couldn't create draft");
          setSaveState("error");
          setErrorKind("network");
          return;
        }
        setMyApplication(result.data);
        appRef.current = result.data;

        const freshIds = latestIdsRef.current;
        if (freshIds.length > 1) {
          const r2 = await updateApplication(
            result.data._id,
            buildBody(freshIds, responsesByCommitteeRef.current, result.data),
          );
          if (!r2.success) {
            if (r2.notFound) {
              setError("Application not found");
              setErrorKind("notFound");
            } else if (r2.submittedBlock) {
              setError("Application already submitted");
              setErrorKind("submittedBlock");
            } else {
              setError(r2.error || "Save failed");
              setErrorKind("network");
            }
            setSaveState("error");
            return;
          }
          setMyApplication(r2.data);
          appRef.current = r2.data;
        }
      } else {
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
      }
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
        // empty
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
    if (selectedCommitteeIds.length > 0) {
      hasEverSelectedRef.current = true;
    }

    const app = appRef.current;
    const hasDraft = Boolean(app && app._id);
    if (selectedCommitteeIds.length === 0 && !hasDraft) {
      setSaveState("idle");
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    if (hasDraft && selectedCommitteeIds.length > 0) {
      const persisted = [
        app.firstChoiceCommittee,
        app.secondChoiceCommittee,
        app.thirdChoiceCommittee,
      ].filter(Boolean);
      const matches =
        persisted.length === selectedCommitteeIds.length &&
        persisted.every((id, i) => id === selectedCommitteeIds[i]);
      if (matches) {
        setSaveState("idle");
        return undefined;
      }
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
  }, [selectedCommitteeIds, runSave]);

  const flushPending = useCallback(async () => {
    const hasDraft = Boolean(appRef.current && appRef.current._id);
    if (latestIdsRef.current.length === 0 && !hasDraft) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      await runSave();
    } else if (inFlightRef.current) {
      try {
        await inFlightRef.current;
      } catch {
        // empty
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
