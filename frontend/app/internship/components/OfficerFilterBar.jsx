"use client";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const CHOICE_OPTIONS = [
  { value: "all", label: "All choices" },
  { value: "1", label: "1st Choice" },
  { value: "2", label: "2nd Choice" },
  { value: "3", label: "3rd Choice" },
];

export default function OfficerFilterBar({
  statusFilter,
  onStatusFilterChange,
  choiceFilter,
  onChoiceFilterChange,
  searchInput,
  onSearchInputChange,
}) {
  return (
    <div className="officer-filter-bar">
      <input
        type="search"
        className="officer-filter-bar__search"
        placeholder="Search by name or email"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        aria-label="Search applications by name or email"
      />

      <label className="officer-filter-bar__field">
        <span className="officer-filter-bar__label">Status</span>
        <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="officer-filter-bar__field">
        <span className="officer-filter-bar__label">Choice</span>
        <select value={choiceFilter} onChange={(event) => onChoiceFilterChange(event.target.value)}>
          {CHOICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
