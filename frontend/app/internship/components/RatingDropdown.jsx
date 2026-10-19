"use client";

import { memo, useState } from "react";

import updateApplicationReview from "@/app/actions/internship/updateApplicationReview";

const RATING_OPTIONS = [
  { value: "", label: "Not rated" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
];

function RatingDropdown({ applicationId, reviewField, value, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (event) => {
    const nextValue = event.target.value || null;

    setSaving(true);
    setError(null);

    const result = await updateApplicationReview(applicationId, reviewField, nextValue);

    setSaving(false);

    if (!result.success) {
      setError(result.error || "Update failed");
      return;
    }

    onChanged(applicationId, result.data);
  };

  const currentLabel = RATING_OPTIONS.find((option) => option.value === (value || ""))?.label ?? "";

  return (
    <div className="rating-dropdown">
      <select
        className={`rating-dropdown__select rating-dropdown__select--${value || "unrated"}`}
        value={value || ""}
        onChange={handleChange}
        disabled={saving}
        aria-label="Update rating"
        title={currentLabel}
      >
        {RATING_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="rating-dropdown__error">{error}</span>}
    </div>
  );
}

export default memo(RatingDropdown);
