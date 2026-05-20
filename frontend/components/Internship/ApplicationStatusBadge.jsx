"use client";

import React from "react";

const STATUS_LABELS = {
  pending: "Pending",
  reviewing: "Reviewing",
  interview_scheduled: "Interview Scheduled",
  accepted: "Accepted",
  rejected: "Rejected",
};

/**
 * @param {Object} props
 * @param {string} props.status - One of: pending, reviewing, interview_scheduled, accepted, rejected
 * @param {string} [props.committeeName] - Optional prefix label
 */
export default function ApplicationStatusBadge({ status, committeeName }) {
  const label = STATUS_LABELS[status] ?? status;
  const displayLabel = committeeName ? `${committeeName}: ${label}` : label;

  return (
    <span className={`status-badge status-badge--${status}`}>
      {displayLabel}
    </span>
  );
}
