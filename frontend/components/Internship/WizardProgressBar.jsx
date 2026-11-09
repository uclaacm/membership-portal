"use client";

export default function WizardProgressBar({ currentStep, totalSteps }) {
  const segments = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex w-full items-center gap-2" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {segments.map(step => (
        <div
          key={step}
          className={`h-2 flex-1 rounded-full ${step <= currentStep ? "bg-blue-600" : "bg-gray-200"}`}
        />
      ))}
    </div>
  );
}
