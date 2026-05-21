"use client";

import { useAtomValue } from "jotai";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { committeesAtom } from "@/lib/atoms";

function rankLabel(rank) {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  return "3rd";
}

function SortableRow({ id, rank, committeeName, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const rowClasses = `flex items-center gap-3 rounded-md border bg-slate-50 p-3 ${
    isDragging ? "opacity-50 ring-2 ring-blue-600" : ""
  }`;

  return (
    <li ref={setNodeRef} style={style} className={rowClasses}>
      <span
        {...attributes}
        {...listeners}
        className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing"
      >
        <i className="fa-solid fa-grip-vertical text-slate-400" />
        <span className="text-sm font-semibold text-blue-700 w-8">{rankLabel(rank)}</span>
        <span className="text-slate-900">{committeeName}</span>
      </span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label={`Remove ${committeeName}`}
        className="text-slate-400 hover:text-slate-700"
      >
        <i className="fa-solid fa-xmark" />
      </button>
    </li>
  );
}

export default function RankedList({ selectedCommitteeIds, onReorder, onRemove }) {
  const committees = useAtomValue(committeesAtom);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (selectedCommitteeIds.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-500">
        Pick a committee above to see your ranked preferences here.
      </p>
    );
  }

  const lookupName = id => {
    const match = committees ? committees.find(c => c.id === id) : null;
    return match ? match.displayName : id;
  };

  const handleDragEnd = event => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedCommitteeIds.indexOf(active.id);
    const newIndex = selectedCommitteeIds.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(selectedCommitteeIds, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={selectedCommitteeIds} strategy={verticalListSortingStrategy}>
        <ul className="mt-6 flex flex-col gap-2">
          {selectedCommitteeIds.map((id, i) => (
            <SortableRow
              key={id}
              id={id}
              rank={i + 1}
              committeeName={lookupName(id)}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
