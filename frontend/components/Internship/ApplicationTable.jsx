"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function applicationStatuses(application) {
  return [
    application.firstChoiceStatus,
    application.secondChoiceStatus,
    application.thirdChoiceStatus,
  ].filter(Boolean);
}

function applicationCommittees(application) {
  return [
    application.firstChoiceCommittee,
    application.secondChoiceCommittee,
    application.thirdChoiceCommittee,
  ].filter(Boolean);
}

export default function ApplicationTable({ applications = [], committees = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");

  const committeeLookup = useMemo(() => {
    const map = new Map();
    committees.forEach(c => map.set(c.id, c.displayName ?? c.name));
    return map;
  }, [committees]);

  const statusOptions = useMemo(() => {
    const set = new Set();
    applications.forEach(app => {
      applicationStatuses(app).forEach(s => set.add(s));
    });
    return Array.from(set).sort();
  }, [applications]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter(app => {
      if (term) {
        const haystack = `${app.firstName ?? ""} ${app.lastName ?? ""} ${app.email ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (statusFilter !== "all" && !applicationStatuses(app).includes(statusFilter)) {
        return false;
      }

      if (committeeFilter !== "all" && !applicationCommittees(app).includes(committeeFilter)) {
        return false;
      }

      return true;
    });
  }, [applications, search, statusFilter, committeeFilter]);

  return (
    <div className="application-table-wrapper">
      <div className="application-table-wrapper__header">
        <h3>Applications</h3>
        <span className="application-table-wrapper__count">
          {filtered.length} of {applications.length}
        </span>
      </div>

      <div className="application-filters">
        <input
          type="search"
          className="application-filters__search"
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search applications"
        />

        <label className="application-filters__field">
          <span className="application-filters__label">Status</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="application-filters__field">
          <span className="application-filters__label">Committee</span>
          <select
            value={committeeFilter}
            onChange={e => setCommitteeFilter(e.target.value)}
          >
            <option value="all">All</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>
                {c.displayName ?? c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="application-table-wrapper__empty">
          {applications.length === 0
            ? "No applications yet."
            : "No applications match the current filters."}
        </div>
      ) : (
        <table className="application-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>University</th>
              <th>Major</th>
              <th>Grad Year</th>
              <th>Committees</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app._id}>
                <td>
                  {app.firstName} {app.lastName}
                </td>
                <td>{app.email}</td>
                <td>{app.university}</td>
                <td>{app.major}</td>
                <td>{app.graduationYear ?? "—"}</td>
                <td>
                  <div className="application-table__committees">
                    {[
                      { id: app.firstChoiceCommittee, rank: "1st" },
                      { id: app.secondChoiceCommittee, rank: "2nd" },
                      { id: app.thirdChoiceCommittee, rank: "3rd" },
                    ]
                      .filter(c => c.id)
                      .map(c => (
                        <span key={c.rank} className="application-table__committee">
                          <span className="application-table__rank">{c.rank}</span>
                          {committeeLookup.get(c.id) ?? c.id}
                        </span>
                      ))}
                  </div>
                </td>
                <td>
                  <div className="application-table__status-list">
                    {[
                      { rank: "1st", status: app.firstChoiceStatus },
                      { rank: "2nd", status: app.secondChoiceStatus },
                      { rank: "3rd", status: app.thirdChoiceStatus },
                    ]
                      .filter(s => s.status)
                      .map(s => (
                        <span key={s.rank} className="application-table__status">
                          <span className="application-table__rank">{s.rank}</span>
                          {s.status}
                        </span>
                      ))}
                  </div>
                </td>
                <td>{formatDate(app.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
