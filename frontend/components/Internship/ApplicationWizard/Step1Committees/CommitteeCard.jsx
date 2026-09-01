"use client";

function rankLabel(rank) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return "";
}

export default function CommitteeCard({ committee, rank, isFullySelected, isInactive, onToggle }) {
  const isSelected = rank !== null && rank !== undefined;

  const isDisabled = isInactive ? !isSelected : isFullySelected && !isSelected;

  let stateClasses;
  if (isInactive) {
    stateClasses = isSelected
      ? "ring-2 ring-blue-600 border-blue-600 bg-slate-50 opacity-60"
      : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50";
  } else if (isDisabled) {
    stateClasses = "border-slate-200 bg-white cursor-not-allowed opacity-50";
  } else if (isSelected) {
    stateClasses = "ring-2 ring-blue-600 border-blue-600 bg-white";
  } else {
    stateClasses = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50";
  }

  const handleClick = () => {
    if (isDisabled) return;
    onToggle();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      data-committee-id={committee.id}
      aria-pressed={isSelected}
      className={`relative w-full text-left rounded-lg border p-4 transition-colors ${stateClasses}`}
    >
      {isSelected && (
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          {rankLabel(rank)}
        </span>
      )}
      {isInactive && !isSelected && (
        <span className="absolute top-2 right-2 bg-slate-400 text-white text-xs font-medium px-2 py-0.5 rounded-full">
          Closed
        </span>
      )}
      <h3 className="font-semibold text-slate-900">{committee.displayName}</h3>
      {committee.description && (
        <p className="mt-1 text-sm text-slate-600">{committee.description}</p>
      )}
      {isInactive && (
        <p className="mt-1 text-xs text-slate-500">Not currently accepting applications</p>
      )}
    </button>
  );
}
