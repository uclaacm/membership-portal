"use client";

import "./style.scss";

export default function CommitteeCard({ committee }) {
  return (
    <div className="committee-card">
      <h4 className="committee-card__name">{committee.displayName || committee.name}</h4>
      {committee.description && (
        <p className="committee-card__description">{committee.description}</p>
      )}
    </div>
  );
}
