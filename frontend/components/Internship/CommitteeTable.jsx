"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BulkActionBar from "@/components/Internship/BulkActionBar";
import ConfirmationModal from "@/components/Modal/confirmationModal";
import bulkUpdateCommitteeStatus from "@/app/actions/internship/bulkUpdateCommitteeStatus";
import deleteCommittee from "@/app/actions/internship/deleteCommittee";
import fetchApplicationCycle from "@/app/actions/internship/fetchApplicationCycle";
import advanceApplicationCycle from "@/app/actions/internship/advanceApplicationCycle";

function formatDeadline(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function CycleControls({ onAdvanced }) {
  const [expanded, setExpanded] = useState(false);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCycle, setNewCycle] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!expanded || info) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await fetchApplicationCycle();
      if (cancelled) return;
      setLoading(false);
      if (result.success) {
        setInfo(result.data);
        setNewCycle(result.data.suggestedNextCycle);
      } else {
        setError(result.error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [expanded, info]);

  async function handleConfirmAdvance() {
    setConfirming(false);
    setPending(true);
    setError(null);
    const result = await advanceApplicationCycle(newCycle);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setExpanded(false);
    setInfo(null);
    onAdvanced?.(result);
  }

  return (
    <div className="cycle-controls">
      <button
        type="button"
        className="committee-table-wrapper__bulk-btn committee-table-wrapper__bulk-btn--warning"
        onClick={() => setExpanded((prev) => !prev)}
      >
        Start New Application Cycle
      </button>

      {expanded && (
        <div className="cycle-controls__panel">
          {loading && <div className="cycle-controls__loading">Loading cycle info…</div>}
          {error && <div className="committee-table-wrapper__error">{error}</div>}
          {info && (
            <>
              <div className="cycle-controls__current">
                Current cycle: <strong>{info.currentCycle}</strong>
              </div>
              <label className="cycle-controls__field">
                <span>New cycle label</span>
                <input
                  type="text"
                  value={newCycle}
                  onChange={(e) => setNewCycle(e.target.value)}
                />
              </label>
              <p className="cycle-controls__warning">
                This archives every committee&apos;s current-cycle applications and makes the
                cycle above the new current cycle. Applications remain accessible in the
                past-cycles view.
              </p>
              <div className="cycle-controls__actions">
                <button
                  type="button"
                  className="committee-form__danger-btn committee-form__danger-btn--delete"
                  disabled={pending || !newCycle.trim()}
                  onClick={() => setConfirming(true)}
                >
                  {pending ? "Advancing…" : "Advance Cycle"}
                </button>
                <button
                  type="button"
                  className="committee-table-wrapper__bulk-btn"
                  onClick={() => setExpanded(false)}
                  disabled={pending}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmationModal
        opened={confirming}
        title="Start a new application cycle?"
        message={`This archives every committee's current-cycle applications and sets "${newCycle}" as the new current cycle. This cannot be undone from the UI.`}
        submit={handleConfirmAdvance}
        cancel={() => setConfirming(false)}
      />
    </div>
  );
}

export default function CommitteeTable({ committees, onMutated }) {
  const [selected, setSelected] = useState(() => new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [cycleNotice, setCycleNotice] = useState(null);
  const [deleteNotice, setDeleteNotice] = useState(null);

  const allIds = useMemo(() => committees.map(c => c.id), [committees]);
  const allChecked = allIds.length > 0 && selected.size === allIds.length;
  const someChecked = selected.size > 0 && !allChecked;
  const deleteTarget = useMemo(
    () => committees.find(c => c.id === deleteTargetId) ?? null,
    [committees, deleteTargetId],
  );

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

  async function handleConfirmDelete() {
    const id = deleteTargetId;
    const name = deleteTarget?.displayName ?? "Committee";
    setDeleteTargetId(null);
    setPending(true);
    setError(null);
    const result = await deleteCommittee(id);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    const parts = [];
    if (result.deletedApplications > 0) {
      parts.push(`deleted ${result.deletedApplications} application${result.deletedApplications === 1 ? "" : "s"} that had no other committee choice`);
    }
    if (result.updatedApplications > 0) {
      parts.push(`removed this committee's choice from ${result.updatedApplications} other application${result.updatedApplications === 1 ? "" : "s"}`);
    }
    setDeleteNotice(`${name} deleted.${parts.length > 0 ? ` Also ${parts.join(" and ")}.` : ""}`);
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
          <CycleControls
            onAdvanced={(result) => {
              setCycleNotice(
                `Advanced to cycle ${result.newCycle}. Archived ${result.archivedCount} application${result.archivedCount === 1 ? "" : "s"}.`,
              );
              onMutated?.();
            }}
          />
          <Link href="/internship/admin/committees/new" className="committee-table__edit-link">
            + Create Committee
          </Link>
        </div>
      </div>

      {cycleNotice && <div className="cycle-controls__notice">{cycleNotice}</div>}
      {deleteNotice && <div className="cycle-controls__notice">{deleteNotice}</div>}
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
                  <div className="committee-table__row-actions">
                    <Link
                      href={`/internship/admin/committees/${c.id}/edit`}
                      className="committee-table__edit-link"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="committee-table__delete-link"
                      disabled={pending}
                      onClick={() => setDeleteTargetId(c.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmationModal
        opened={deleteTargetId !== null}
        title="Permanently delete this committee?"
        message={
          `This permanently deletes "${deleteTarget?.displayName ?? ""}" and cannot be undone.`
          + (deleteTarget?.applicationCount
            ? ` ${deleteTarget.applicationCount} application${deleteTarget.applicationCount === 1 ? "" : "s"} reference this committee — any application with no other committee choice will be deleted entirely, and this committee's choice, responses, status, and officer review will be removed from any application that also chose a different committee.`
            : " No applications currently reference this committee.")
        }
        submit={handleConfirmDelete}
        cancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
