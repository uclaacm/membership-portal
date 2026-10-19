"use client";

import React from "react";

const STATUS_LABELS = {
  pending: "Pending",
  reviewing: "Reviewing",
  interview_scheduled: "Interview Scheduled",
  accepted: "Accepted",
  rejected: "Rejected",
  under_review: "Under review",
};

/**
 * @param {Object} props
 * @param {string|null} props.status - One of: pending, reviewing, interview_scheduled, accepted, rejected;
 *   null while the committee hasn't released decisions, shown as "Under review"
 * @param {string} [props.committeeName] - Optional prefix label
 */
export default function ApplicationStatusBadge({ status: rawStatus, committeeName }) {
  const status = rawStatus ?? "under_review";
  const label = STATUS_LABELS[status] ?? status;
  const displayLabel = committeeName ? `${committeeName}: ${label}` : label;

  return (
    <span className={`status-badge status-badge--${status}`}>
      {displayLabel}
    </span>
  );
}
