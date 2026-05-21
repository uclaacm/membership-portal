"use client";

import { useAtomValue } from "jotai";

import CommitteeCard from "./CommitteeCard";
import { committeesAtom } from "@/lib/atoms";

export default function CommitteeGrid({ selectedCommitteeIds, onToggle }) {
  const committees = useAtomValue(committeesAtom);

  if (!committees || committees.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse bg-slate-200 rounded-lg h-24" />
        ))}
      </div>
    );
  }

  const isFullySelected = selectedCommitteeIds.length >= 3;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {committees.map(committee => {
        const idx = selectedCommitteeIds.indexOf(committee.id);
        const rank = idx === -1 ? null : idx + 1;
        return (
          <CommitteeCard
            key={committee.id}
            committee={committee}
            rank={rank}
            isFullySelected={isFullySelected}
            onToggle={() => onToggle(committee.id)}
          />
        );
      })}
    </div>
  );
}
