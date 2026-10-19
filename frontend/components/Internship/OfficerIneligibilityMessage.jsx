"use client";

import "./style.scss";

export default function OfficerIneligibilityMessage() {
  return (
    <div className="officer-ineligibility-message">
      <h2>Application Unavailable</h2>
      <p>
        Officers and Admins are not eligible to apply for internship positions.
      </p>
      <p>If you need to review applications, visit your dashboard.</p>
    </div>
  );
}
