"use client";

import { useState } from "react";
import { useAtomValue } from "jotai";

import WizardProgressBar from "@/components/Internship/WizardProgressBar";
import { myApplicationAtom } from "@/lib/atoms";

const TOTAL_STEPS = 4;

export default function ApplicationWizard() {
  const draft = useAtomValue(myApplicationAtom);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="mx-auto mt-[calc(61px+2rem)] max-w-3xl p-6">
      {draft && (
        <div className="mb-4 rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Existing draft loaded for {draft.applicationCycle}
          {draft.lastModifiedAt ? ` — last saved ${new Date(draft.lastModifiedAt).toLocaleString()}` : ""}
        </div>
      )}
      <WizardProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      <div className="mt-6">Step {currentStep} content</div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 disabled:opacity-50"
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => setCurrentStep(s => Math.min(TOTAL_STEPS, s + 1))}
          disabled={currentStep === TOTAL_STEPS}
        >
          Next
        </button>
      </div>
    </div>
  );
}
