"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import updateApplication from "@/app/actions/internship/updateApplication";
import { myApplicationAtom } from "@/lib/atoms";

const DEBOUNCE_MS = 500;

export default function useStep3Save(resumeUrl, canSave) {
  const [myApplication, setMyApplication] = useAtom(myApplicationAtom);
  const [saveState, setSaveState] = useState("idle");
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);

  const timerRef = useRef(null);
  const inFlightRef = useRef(null);
  const latestResumeUrlRef = useRef(resumeUrl);
  const canSaveRef = useRef(canSave);
  const appRef = useRef(myApplication);
  const saveStateRef = useRef(saveState);
  const errorRef = useRef(error);

  useEffect(() => {
    latestResumeUrlRef.current = resumeUrl;
  }, [resumeUrl]);

  useEffect(() => {
    canSaveRef.current = canSave;
  }, [canSave]);

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
    const app = appRef.current;
    const nextResumeUrl = latestResumeUrlRef.current.trim();

    if (!app || !app._id || !canSaveRef.current) {
      setSaveState("idle");
      return;
    }

    setSaveState("saving");
    setError(null);
    setErrorKind(null);

    try {
      const result = await updateApplication(app._id, { resumeUrl: nextResumeUrl });
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
    if (!app || !app._id || !canSave || !resumeUrl.trim()) {
      setSaveState("idle");
      return undefined;
    }

    if ((app.resumeUrl || "") === resumeUrl.trim()) {
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
  }, [resumeUrl, canSave, runSave]);

  const flushPending = useCallback(async () => {
    if (!appRef.current || !appRef.current._id || !canSaveRef.current) return;

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
