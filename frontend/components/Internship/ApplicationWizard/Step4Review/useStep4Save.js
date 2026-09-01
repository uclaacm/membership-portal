"use client";

import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import updateApplication from "@/app/actions/internship/updateApplication";
import { myApplicationAtom } from "@/lib/atoms";

const DEBOUNCE_MS = 500;

function normalizePhone(phone) {
  return phone.trim();
}

export default function useStep4Save({ phone, graduationYear, canSave }) {
  const [myApplication, setMyApplication] = useAtom(myApplicationAtom);
  const [saveState, setSaveState] = useState("idle");
  const [error, setError] = useState(null);
  const [errorKind, setErrorKind] = useState(null);

  const timerRef = useRef(null);
  const inFlightRef = useRef(null);
  const latestValuesRef = useRef({ phone, graduationYear, canSave });
  const appRef = useRef(myApplication);
  const saveStateRef = useRef(saveState);
  const errorRef = useRef(error);

  useEffect(() => {
    latestValuesRef.current = { phone, graduationYear, canSave };
  }, [phone, graduationYear, canSave]);

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
    const values = latestValuesRef.current;

    if (!app || !app._id || !values.canSave) {
      setSaveState("idle");
      return;
    }

    setSaveState("saving");
    setError(null);
    setErrorKind(null);

    try {
      const result = await updateApplication(app._id, {
        phone: normalizePhone(values.phone),
        graduationYear: values.graduationYear,
      });

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
    if (!app || !app._id || !canSave) {
      setSaveState("idle");
      return undefined;
    }

    const phoneMatches = (app.phone || "") === normalizePhone(phone);
    const yearMatches = Number(app.graduationYear) === Number(graduationYear);
    if (phoneMatches && yearMatches) {
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
  }, [phone, graduationYear, canSave, runSave]);

  const flushPending = useCallback(async () => {
    if (!appRef.current || !appRef.current._id || !latestValuesRef.current.canSave) return;

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
