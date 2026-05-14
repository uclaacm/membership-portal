"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BulkActionBar from "@/components/Internship/BulkActionBar";
import bulkUpdateCommitteeStatus from "@/app/actions/internship/bulkUpdateCommitteeStatus";

function formatDeadline(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function CommitteeTable({ committees, onMutated }) {
  const [selected, setSelected] = useState(() => new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const allIds = useMemo(() => committees.map(c => c.id), [committees]);
  const allChecked = allIds.length > 0 && selected.size === allIds.length;
  const someChecked = selected.size > 0 && !allChecked;

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(allIds));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function runBulk(action, committeeIds) {
    setPending(true);
    setError(null);
    const result = await bulkUpdateCommitteeStatus({ action, committeeIds });
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    clearSelection();
    onMutated?.();
  }

  return (
    <div className="committee-table-wrapper">
      <div className="committee-table-wrapper__header">
        <h3>Committees</h3>
        <div className="committee-table-wrapper__actions">
          <button
            type="button"
            className="committee-table-wrapper__bulk-btn"
            onClick={() => runBulk("open")}
            disabled={pending}
          >
            Open All
          </button>
          <button
            type="button"
            className="committee-table-wrapper__bulk-btn"
            onClick={() => runBulk("close")}
            disabled={pending}
          >
            Close All
          </button>
          <Link href="/internship/admin/committees/new" className="committee-table__edit-link">
            + Create Committee
          </Link>
        </div>
      </div>

      {error && <div className="committee-table-wrapper__error">{error}</div>}

      {selected.size > 0 && (
        <BulkActionBar
          selectedCount={selected.size}
          disabled={pending}
          onOpen={() => runBulk("open", Array.from(selected))}
          onClose={() => runBulk("close", Array.from(selected))}
          onClear={clearSelection}
        />
      )}

      {committees.length === 0 ? (
        <div className="committee-table-wrapper__empty">No committees yet.</div>
      ) : (
        <table className="committee-table">
          <thead>
            <tr>
              <th className="committee-table__checkbox-col">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => {
                    if (el) el.indeterminate = someChecked;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all committees"
                />
              </th>
              <th>Display Name</th>
              <th>Internal Name</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Intern Limit</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {committees.map(c => (
              <tr key={c.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    aria-label={`Select ${c.displayName}`}
                  />
                </td>
                <td>{c.displayName}</td>
                <td>{c.name}</td>
                <td>
                  <span
                    className={`committee-table__status committee-table__status--${
                      c.isActive ? "active" : "inactive"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{formatDeadline(c.applicationDeadline)}</td>
                <td>{c.internLimit ?? "—"}</td>
                <td>{c.applicationCount ?? 0}</td>
                <td>
                  <Link
                    href={`/internship/admin/committees/${c.id}/edit`}
                    className="committee-table__edit-link"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
