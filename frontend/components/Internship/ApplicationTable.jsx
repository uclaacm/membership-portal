"use client";

import { useEffect, useMemo, useState } from "react";
import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";
import fetchApplicationCycle from "@/app/actions/internship/fetchApplicationCycle";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import AdminApplicationDetailDrawer from "@/app/internship/components/AdminApplicationDetailDrawer";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const PAGE_SIZE = 25;

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

function resolveCycleParams(cycleFilter) {
  if (cycleFilter === "current") return {};
  if (cycleFilter === "archived") return { archived: true };
  if (cycleFilter.startsWith("archived:")) {
    return { archived: true, applicationCycle: cycleFilter.slice("archived:".length) };
  }
  return {};
}

export default function ApplicationTable({ committees = [] }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("current");
  const [page, setPage] = useState(1);
  const [cycleInfo, setCycleInfo] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [error, setError] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  const committeeLookup = useMemo(() => {
    const map = new Map();
    committees.forEach(c => map.set(c.id, c.displayName ?? c.name));
    return map;
  }, [committees]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchApplicationCycle();
      if (!cancelled && result.success) setCycleInfo(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      const result = await fetchAllApplications({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        committeeId: committeeFilter !== "all" ? committeeFilter : undefined,
        ...resolveCycleParams(cycleFilter),
      });
      if (cancelled) return;
      if (result.success) {
        setApplications(result.data);
        setPagination(result.pagination);
        setError(null);
        setStatus("success");
      } else {
        setError(result.error);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter, committeeFilter, cycleFilter]);

  const selectedApplication = applications.find((app) => app._id === selectedApplicationId) ?? null;

  function handleApplicationChanged(applicationId, updatedApplication) {
    setApplications((prev) => prev.map((app) => (
      app._id === applicationId ? { ...app, ...updatedApplication } : app
    )));
  }

  return (
    <div className="application-table-wrapper">
      <div className="application-table-wrapper__header">
        <h3>Applications</h3>
        <span className="application-table-wrapper__count">
          {pagination.total} application{pagination.total === 1 ? "" : "s"}
        </span>
      </div>

      <div className="application-filters">
        <input
          type="search"
          className="application-filters__search"
          placeholder="Search by name or email"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search applications"
        />

        <label className="application-filters__field">
          <span className="application-filters__label">Status</span>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="application-filters__field">
          <span className="application-filters__label">Committee</span>
          <select value={committeeFilter} onChange={e => { setCommitteeFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            {committees.map(c => (
              <option key={c.id} value={c.id}>
                {c.displayName ?? c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="application-filters__field">
          <span className="application-filters__label">Cycle</span>
          <select value={cycleFilter} onChange={e => { setCycleFilter(e.target.value); setPage(1); }}>
            <option value="current">
              Current{cycleInfo ? ` (${cycleInfo.currentCycle})` : ""}
            </option>
            <option value="archived">Archived (all past cycles)</option>
            {cycleInfo?.pastCycles?.map(cycle => (
              <option key={cycle} value={`archived:${cycle}`}>
                Archived — {cycle}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "loading" && (
        <div className="application-table-wrapper__empty">Loading applications…</div>
      )}

      {status === "error" && (
        <div className="committee-table-wrapper__error">{error}</div>
      )}

      {status === "success" && applications.length === 0 && (
        <div className="application-table-wrapper__empty">
          No applications match the current filters.
        </div>
      )}

      {status === "success" && applications.length > 0 && (
        <>
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
              {applications.map(app => (
                <tr key={app._id} onClick={() => setSelectedApplicationId(app._id)}>
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

          {pagination.pages > 1 && (
            <div className="application-table-wrapper__pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <AdminApplicationDetailDrawer
        application={selectedApplication}
        committees={committees}
        onClose={() => setSelectedApplicationId(null)}
        onApplicationChanged={handleApplicationChanged}
      />
    </div>
  );
}
