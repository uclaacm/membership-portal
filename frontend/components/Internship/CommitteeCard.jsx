"use client";

import "./style.scss";

export default function CommitteeCard({ committee }) {
  const isInactive = !committee.isActive;

  return (
    <div className={`committee-card ${isInactive ? "committee-card--inactive" : ""}`}>
      <h4 className="committee-card__name">{committee.displayName || committee.name}</h4>
      {committee.description && (
        <p className="committee-card__description">{committee.description}</p>
      )}
      <div className="committee-card__meta">
        {committee.internLimit !== undefined && committee.internLimit > 0 && (
          <span className="committee-card__meta-item">
            Up to {committee.internLimit} intern{committee.internLimit === 1 ? "" : "s"}
          </span>
        )}
        {committee.applicationDeadline && (
          <span className="committee-card__meta-item">
            Apply by {new Date(committee.applicationDeadline).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}
