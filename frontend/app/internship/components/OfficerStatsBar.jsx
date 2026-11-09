"use client";

const STATUS_PILLS = [
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function OfficerStatsBar({ counts, activeStatus, onSelectStatus }) {
  return (
    <div className="officer-stats-bar" role="group" aria-label="Filter by status">
      {STATUS_PILLS.map((pill) => {
        const isActive = activeStatus === pill.value;
        return (
          <button
            key={pill.value}
            type="button"
            className={`officer-stats-bar__pill officer-stats-bar__pill--${pill.value}${
              isActive ? " officer-stats-bar__pill--active" : ""
            }`}
            onClick={() => onSelectStatus(isActive ? "all" : pill.value)}
            aria-pressed={isActive}
          >
            <span className="officer-stats-bar__count">{counts[pill.value] ?? 0}</span>
            <span className="officer-stats-bar__label">{pill.label}</span>
          </button>
        );
      })}
    </div>
  );
}
