"use client";

import { memo, useState } from "react";

import updateApplicationStatus from "@/app/actions/internship/updateApplicationStatus";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

function StatusUpdateDropdown({ applicationId, statusField, status, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (event) => {
    const nextStatus = event.target.value;
    setSaving(true);
    setError(null);

    const result = await updateApplicationStatus(applicationId, statusField, nextStatus);

    setSaving(false);

    if (!result.success) {
      setError(result.error || "Update failed");
      return;
    }

    onChanged(applicationId, result.data);
  };

  const currentLabel = STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "";

  return (
    <div className="status-update-dropdown">
      <select
        className={`status-update-dropdown__select status-update-dropdown__select--${status}`}
        value={status}
        onChange={handleChange}
        disabled={saving}
        aria-label="Update application status"
        title={currentLabel}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="status-update-dropdown__error">{error}</span>}
    </div>
  );
}

export default memo(StatusUpdateDropdown);
