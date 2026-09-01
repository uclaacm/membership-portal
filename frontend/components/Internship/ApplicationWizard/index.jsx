"use client";

import { useCallback, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";

import WizardProgressBar from "@/components/Internship/WizardProgressBar";
import Step1Committees from "@/components/Internship/ApplicationWizard/Step1Committees";
import Step2Questions from "@/components/Internship/ApplicationWizard/Step2Questions";
import Step3Resume from "@/components/Internship/ApplicationWizard/Step3Resume";
import Step4Review from "@/components/Internship/ApplicationWizard/Step4Review";
import submitApplication from "@/app/actions/internship/submitApplication";
import { myApplicationAtom } from "@/lib/atoms";

const TOTAL_STEPS = 4;

export default function ApplicationWizard() {
  const router = useRouter();
  const [draft, setMyApplication] = useAtom(myApplicationAtom);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [step3Valid, setStep3Valid] = useState(false);
  const [step4Valid, setStep4Valid] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const flushPendingStep1Ref = useRef(null);
  const flushPendingStep2Ref = useRef(null);
  const flushPendingStep3Ref = useRef(null);
  const flushPendingStep4Ref = useRef(null);
  const advancingRef = useRef(false);
  const handleStep1ValidityChange = useCallback((valid) => setStep1Valid(valid), []);
  const handleStep2ValidityChange = useCallback((valid) => setStep2Valid(valid), []);
  const handleStep3ValidityChange = useCallback((valid) => setStep3Valid(valid), []);
  const handleStep4ValidityChange = useCallback((valid) => setStep4Valid(valid), []);

  const nextDisabled =
    (currentStep === 1 && !step1Valid) ||
    (currentStep === 2 && !step2Valid) ||
    (currentStep === 3 && !step3Valid) ||
    advancing;

  const submitDisabled = !step4Valid || submitting || advancing;

  const flushCurrentStep = async () => {
    if (currentStep === 1 && flushPendingStep1Ref.current) {
      await flushPendingStep1Ref.current();
    }
    if (currentStep === 2 && flushPendingStep2Ref.current) {
      await flushPendingStep2Ref.current();
    }
    if (currentStep === 3 && flushPendingStep3Ref.current) {
      await flushPendingStep3Ref.current();
    }
    if (currentStep === 4 && flushPendingStep4Ref.current) {
      await flushPendingStep4Ref.current();
    }
  };

  const resetNextStepValidity = () => {
    if (currentStep === 1) setStep2Valid(false);
    if (currentStep === 2) setStep3Valid(false);
    if (currentStep === 3) setStep4Valid(false);
  };

  const handleNext = async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setAdvancing(true);
    try {
      try { await flushCurrentStep(); } catch { return; }
      resetNextStepValidity();
      setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
    } finally {
      advancingRef.current = false;
      setAdvancing(false);
    }
  };

  const handleBack = async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setAdvancing(true);
    try {
      try { await flushCurrentStep(); } catch { return; }
      if (currentStep === 1) {
        router.push("/internship");
        return;
      }
      setCurrentStep((s) => Math.max(1, s - 1));
    } finally {
      advancingRef.current = false;
      setAdvancing(false);
    }
  };

  const handleSubmit = async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      try {
        await flushCurrentStep();
      } catch (err) {
        setSubmitError((err && err.message) || "Couldn't save your latest changes. Please retry.");
        return;
      }

      if (!draft || !draft._id) {
        setSubmitError("No application to submit.");
        return;
      }

      const result = await submitApplication(draft._id);
      if (!result.success) {
        setSubmitError(result.error || "Submit failed");
        return;
      }

      setMyApplication(result.data);
      router.replace("/internship");
    } finally {
      advancingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-3xl p-6">
      {draft && (
        <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Existing draft loaded for {draft.applicationCycle}
          {draft.lastModifiedAt ? ` — last saved ${new Date(draft.lastModifiedAt).toLocaleString()}` : ""}
        </div>
      )}
      <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="mt-6">
        {currentStep === 1 && (
          <Step1Committees
            onValidityChange={handleStep1ValidityChange}
            flushPendingRef={flushPendingStep1Ref}
          />
        )}
        {currentStep === 2 && (
          <Step2Questions
            onValidityChange={handleStep2ValidityChange}
            flushPendingRef={flushPendingStep2Ref}
          />
        )}
        {currentStep === 3 && (
          <Step3Resume
            onValidityChange={handleStep3ValidityChange}
            flushPendingRef={flushPendingStep3Ref}
          />
        )}
        {currentStep === 4 && (
          <Step4Review
            onValidityChange={handleStep4ValidityChange}
            flushPendingRef={flushPendingStep4Ref}
          />
        )}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
          onClick={handleBack}
          disabled={advancing || submitting}
        >
          Back
        </button>
        {currentStep === TOTAL_STEPS ? (
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={submitDisabled}
          >
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        ) : (
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={handleNext}
            disabled={nextDisabled}
          >
            Next
          </button>
        )}
        {submitError && (
          <span className="text-sm text-red-600">{submitError}</span>
        )}
      </div>
    </div>
  );
}
