"use client";

import Switch from "@/components/Switch";

// Presentational only: the caller owns whether decisions are released and how that is saved.
export default function ReleaseDecisionsToggle({ committeeName, released, onChange, saving = false }) {
  return (
    <div className={`release-decisions-toggle${released ? " release-decisions-toggle--on" : ""}`}>
      <Switch
        checked={released}
        onChange={onChange}
        disabled={saving}
        label="Release decisions"
        description={`When on, applicants can see their ${committeeName} application status.`}
        hideDescription
        className="release-decisions-toggle__switch"
      />
    </div>
  );
}
