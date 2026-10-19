"use client";

function rankLabel(rank) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return "";
}

export default function CommitteeTabBar({ tabs, activeIndex, onChange }) {
  if (tabs.length === 0) return null;

  return (
    <div className="flex border-b border-slate-200" role="tablist">
      {tabs.map((tab, index) => {
        const isActive = activeIndex === index;
        const className = isActive
          ? "relative px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
          : "relative px-4 py-2 text-sm font-medium text-slate-600 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300";
        return (
          <button
            key={tab.committeeId}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(index)}
            className={className}
          >
            <span>
              {rankLabel(tab.rank)} • {tab.displayName}
            </span>
            {tab.incomplete && (
              <span
                className="ml-2 inline-block h-2 w-2 rounded-full bg-red-600"
                aria-label="Incomplete"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
