"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";

import useStep3Save from "./useStep3Save";
import isValidResumeUrl from "@/components/Internship/ApplicationWizard/isValidResumeUrl";
import { myApplicationAtom } from "@/lib/atoms";

export default function Step3Resume({ onValidityChange, flushPendingRef }) {
  const router = useRouter();
  const myApplication = useAtomValue(myApplicationAtom);
  const [resumeUrlInput, setResumeUrlInput] = useState("");
  const [touched, setTouched] = useState(false);

  const resumeUrl = touched ? resumeUrlInput : (myApplication?.resumeUrl || "");

  const resumeUrlValid = useMemo(() => isValidResumeUrl(resumeUrl), [resumeUrl]);

  useEffect(() => {
    onValidityChange(resumeUrlValid);
  }, [resumeUrlValid, onValidityChange]);

  const { saveState, error, errorKind, flushPending, retry } = useStep3Save(
    resumeUrl,
    resumeUrlValid,
  );

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

  const showInvalidMessage = touched && resumeUrl.trim() !== "" && !resumeUrlValid;

  const handleChange = useCallback((event) => {
    setTouched(true);
    setResumeUrlInput(event.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    if (!touched) {
      setResumeUrlInput(resumeUrl);
    }
    setTouched(true);
  }, [resumeUrl, touched]);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Resume</h2>
        <p className="text-sm text-slate-600">
          Upload your resume to Google Drive or another online file host, then paste a public link that anyone with the link can open.
        </p>
      </div>

      <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
        Before continuing, confirm the file sharing setting is public, such as Google Drive&apos;s &quot;Anyone with the link can view&quot; option.
      </div>

      <div className="space-y-2">
        <label htmlFor="internship-resume-url" className="block text-sm font-medium text-slate-700">
          Public resume link <span className="text-red-600">*</span>
        </label>
        <input
          id="internship-resume-url"
          type="url"
          inputMode="url"
          placeholder="https://drive.google.com/file/d/..."
          value={resumeUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          className="block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          aria-describedby="internship-resume-url-help"
          aria-invalid={showInvalidMessage}
        />
        <p id="internship-resume-url-help" className="text-xs text-slate-500">
          The link must start with http:// or https:// and be accessible outside your account.
        </p>
        {showInvalidMessage && (
          <p className="text-sm text-red-600">Enter a valid public resume URL before moving on.</p>
        )}
      </div>

      <div className="text-xs text-slate-500 text-right">
        {saveState === "pending" && "Saving..."}
        {saveState === "saving" && "Saving..."}
        {saveState === "idle" && myApplication?._id && resumeUrlValid &&
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
