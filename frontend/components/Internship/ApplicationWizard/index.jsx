"use client";

import { useCallback, useRef, useState } from "react";
import { useAtomValue } from "jotai";

import WizardProgressBar from "@/components/Internship/WizardProgressBar";
import Step1Committees from "@/components/Internship/ApplicationWizard/Step1Committees";
import Step2Questions from "@/components/Internship/ApplicationWizard/Step2Questions";
import { myApplicationAtom } from "@/lib/atoms";

const TOTAL_STEPS = 4;

export default function ApplicationWizard() {
  const draft = useAtomValue(myApplicationAtom);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Valid, setStep1Valid] = useState(false);
  const [step2Valid, setStep2Valid] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const flushPendingStep1Ref = useRef(null);
  const flushPendingStep2Ref = useRef(null);
  const advancingRef = useRef(false);
  const handleStep1ValidityChange = useCallback((valid) => setStep1Valid(valid), []);
  const handleStep2ValidityChange = useCallback((valid) => setStep2Valid(valid), []);

  const nextDisabled =
    currentStep === TOTAL_STEPS ||
    (currentStep === 1 && !step1Valid) ||
    (currentStep === 2 && !step2Valid) ||
    advancing;

  const handleNext = async () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setAdvancing(true);
    try {
      if (currentStep === 1 && flushPendingStep1Ref.current) {
        try { await flushPendingStep1Ref.current(); } catch { return; }
      }
      if (currentStep === 2 && flushPendingStep2Ref.current) {
        try { await flushPendingStep2Ref.current(); } catch { return; }
      }
      setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
    } finally {
      advancingRef.current = false;
      setAdvancing(false);
    }
  };

  return (
    <div className="mx-auto mt-[calc(61px+2rem)] max-w-3xl p-6">
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
        {currentStep > 2 && (
          <div className="text-slate-500">Step {currentStep} content (coming in a later phase)</div>
        )}
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={handleNext}
          disabled={nextDisabled}
        >
          Next
        </button>
      </div>
    </div>
  );
}
