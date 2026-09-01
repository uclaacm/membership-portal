"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import fetchAllApplications from "@/app/actions/internship/fetchAllApplications";
import fetchAllCommittees from "@/app/actions/internship/fetchAllCommittees";
import fetchApplicationStatusCounts from "@/app/actions/internship/fetchApplicationStatusCounts";
import ApplicationDetailDrawer from "@/app/internship/components/ApplicationDetailDrawer";
import ApplicationTable from "@/app/internship/components/ApplicationTable";
import CopyEmailsButton from "@/app/internship/components/CopyEmailsButton";
import OfficerFilterBar from "@/app/internship/components/OfficerFilterBar";
import OfficerStatsBar from "@/app/internship/components/OfficerStatsBar";
import Toast from "@/components/Toast";
import useDebouncedValue from "@/lib/hooks/useDebouncedValue";
import { authUserProfileAtom, officerApplicationsAtom } from "@/lib/atoms";
import CommitteeQuestionsModal from "./CommitteeQuestionsModal";
import "./OfficerDashboard.scss";

const CHOICE_FIELDS = [
  {
    rank: 1,
    committeeField: "firstChoiceCommittee",
    statusField: "firstChoiceStatus",
    responsesField: "firstChoiceResponses",
    officer1RatingField: "firstChoiceOfficer1Rating",
    officer2RatingField: "firstChoiceOfficer2Rating",
    notesField: "firstChoiceNotes",
  },
  {
    rank: 2,
    committeeField: "secondChoiceCommittee",
    statusField: "secondChoiceStatus",
    responsesField: "secondChoiceResponses",
    officer1RatingField: "secondChoiceOfficer1Rating",
    officer2RatingField: "secondChoiceOfficer2Rating",
    notesField: "secondChoiceNotes",
  },
  {
    rank: 3,
    committeeField: "thirdChoiceCommittee",
    statusField: "thirdChoiceStatus",
    responsesField: "thirdChoiceResponses",
    officer1RatingField: "thirdChoiceOfficer1Rating",
    officer2RatingField: "thirdChoiceOfficer2Rating",
    notesField: "thirdChoiceNotes",
  },
];

const EMPTY_STATUS_COUNTS = {
  pending: 0,
  reviewing: 0,
  interview_scheduled: 0,
  accepted: 0,
  rejected: 0,
};

const PAGE_SIZE = 25;

function getCurrentApplicationCycle() {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
}

function normalizeCommitteeName(name) {
  return typeof name === "string" ? name.trim().toLowerCase() : "";
}

// Each application can list up to 3 committee choices; an officer only cares
// about the single slot (if any) that matches their own committee. The API
// already strips response arrays for the other slots — this just picks out
// the one slot that's actually theirs to look at.
function enrichForCommittee(application, committeeId) {
  const match = CHOICE_FIELDS.find((choice) => application[choice.committeeField] === committeeId);
  if (!match) return null;
  return {
    ...application,
    myChoiceRank: match.rank,
    myStatusField: match.statusField,
    myStatus: application[match.statusField],
    myResponses: Array.isArray(application[match.responsesField]) ? application[match.responsesField] : [],
    myOfficer1RatingField: match.officer1RatingField,
    myOfficer1Rating: application[match.officer1RatingField] ?? null,
    myOfficer2RatingField: match.officer2RatingField,
    myOfficer2Rating: application[match.officer2RatingField] ?? null,
    myNotesField: match.notesField,
    myNotes: application[match.notesField] ?? "",
  };
}

export default function OfficerDashboard() {
  const authProfile = useAtomValue(authUserProfileAtom);

  const officerCommitteeNames = (
    authProfile && "committees" in authProfile ? authProfile.committees ?? [] : []
  ).map(normalizeCommitteeName).filter(Boolean);

  const [committees, setCommittees] = useState([]);
  const [committeesStatus, setCommitteesStatus] = useState("loading");
  const [committeesError, setCommitteesError] = useState(null);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);

  const [applications, setApplications] = useAtom(officerApplicationsAtom);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [loadStatus, setLoadStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);

  const [statusCounts, setStatusCounts] = useState(EMPTY_STATUS_COUNTS);

  const [statusFilter, setStatusFilter] = useState("all");
  const [choiceFilter, setChoiceFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [page, setPage] = useState(1);

  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [toast, setToast] = useState({ key: 0, message: "", success: true, visible: false });

  const showToast = useCallback((message, success) => {
    setToast((prev) => ({ key: prev.key + 1, message, success, visible: true }));
  }, []);

  // The Toast component re-arms its hide timer on every prop update where
  // `showing` is true (not just on a false->true transition), so it must be
  // flipped back to false explicitly here rather than left permanently true —
  // otherwise unrelated re-renders (e.g. typing in the search box) would keep
  // resetting its internal timer and it would never disappear.
  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
    return () => clearTimeout(timer);
  }, [toast.key, toast.visible]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCommitteesStatus("loading");
      const result = await fetchAllCommittees();
      if (cancelled) return;
      if (result.success) {
        setCommittees(result.data);
        setCommitteesError(null);
        setCommitteesStatus("success");
      } else {
        setCommitteesError(result.error);
        setCommitteesStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const myCommittees = committees.filter((committee) => (
    officerCommitteeNames.includes(normalizeCommitteeName(committee.displayName))
    || officerCommitteeNames.includes(normalizeCommitteeName(committee.name))
  ));

  useEffect(() => {
    if (myCommittees.length === 0) return;
    const stillValid = myCommittees.some((committee) => committee.id === selectedCommitteeId);
    if (!stillValid) {
      setSelectedCommitteeId(myCommittees[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCommittees.map((committee) => committee.id).join(",")]);

  const myCommittee = myCommittees.find((committee) => committee.id === selectedCommitteeId) ?? null;

  // Used both for the initial/dependency-driven fetch below and as a manual
  // re-trigger from handleApplicationChanged (a status edit shifts counts).
  const loadStatusCounts = useCallback(async () => {
    if (!myCommittee) return;
    const result = await fetchApplicationStatusCounts(myCommittee.id);
    if (result.success) {
      setStatusCounts({ ...EMPTY_STATUS_COUNTS, ...result.counts });
    }
  }, [myCommittee]);

  useEffect(() => {
    if (!myCommittee) return undefined;
    let cancelled = false;
    (async () => {
      const result = await fetchApplicationStatusCounts(myCommittee.id);
      if (cancelled || !result.success) return;
      setStatusCounts({ ...EMPTY_STATUS_COUNTS, ...result.counts });
    })();
    return () => {
      cancelled = true;
    };
  }, [myCommittee]);

  function handleStatusFilterChange(nextStatus) {
    setStatusFilter(nextStatus);
    setPage(1);
  }

  function handleChoiceFilterChange(nextChoice) {
    setChoiceFilter(nextChoice);
    setPage(1);
  }

  function handleSearchInputChange(nextSearch) {
    setSearchInput(nextSearch);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadStatus("loading");
      const result = await fetchAllApplications({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        choiceRank: choiceFilter !== "all" ? choiceFilter : undefined,
      });
      if (cancelled) return;

      if (!result.success) {
        setLoadError(result.error);
        setLoadStatus("error");
        return;
      }

      setApplications(result.data);
      setPagination(result.pagination);
      setLoadError(null);
      setLoadStatus("success");
    })();

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, statusFilter, choiceFilter, setApplications]);

  const enrichedApplications = myCommittee
    ? applications.map((application) => enrichForCommittee(application, myCommittee.id)).filter(Boolean)
    : [];

  const recruitmentCycle = applications[0]?.applicationCycle ?? getCurrentApplicationCycle();

  const selectedApplication = enrichedApplications.find(
    (application) => application._id === selectedApplicationId,
  ) ?? null;

  const handleApplicationChanged = useCallback((applicationId, updatedApplication) => {
    setApplications((prev) => prev.map((application) => (
      application._id === applicationId ? { ...application, ...updatedApplication } : application
    )));
    loadStatusCounts();
  }, [setApplications, loadStatusCounts]);

  const handleQuestionsSaved = useCallback((updatedCommittee) => {
    setCommittees((prev) => prev.map((committee) => (
      committee.id === updatedCommittee.id ? { ...committee, ...updatedCommittee } : committee
    )));
    setIsQuestionsModalOpen(false);
    showToast("Committee questions saved", true);
  }, [showToast]);

  const handleFetchAllEmails = useCallback(async () => {
    const emails = [];
    const fetchOptions = {
      limit: 100,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      choiceRank: choiceFilter !== "all" ? choiceFilter : undefined,
    };

    let currentPage = 1;
    let totalPages = 1;
    do {
      const result = await fetchAllApplications({ ...fetchOptions, page: currentPage });
      if (!result.success) throw new Error(result.error);
      result.data.forEach((application) => {
        if (application.email) emails.push(application.email);
      });
      totalPages = result.pagination.pages;
      currentPage += 1;
    } while (currentPage <= totalPages);

    return emails;
  }, [debouncedSearch, statusFilter, choiceFilter]);

  const handleCopied = useCallback((count) => {
    showToast(`Copied ${count} email address${count === 1 ? "" : "es"}`, true);
  }, [showToast]);

  const handleCopyError = useCallback((message) => {
    showToast(message, false);
  }, [showToast]);

  function handleSelectStatus(nextStatus) {
    handleStatusFilterChange(nextStatus);
  }

  if (committeesStatus === "loading" || (committeesStatus === "success" && loadStatus === "loading" && applications.length === 0)) {
    return <div className="officer-dashboard officer-dashboard__placeholder">Loading applications…</div>;
  }

  if (committeesStatus === "error") {
    return <div className="officer-dashboard officer-dashboard__error">{committeesError}</div>;
  }

  if (loadStatus === "error") {
    return <div className="officer-dashboard officer-dashboard__error">{loadError}</div>;
  }

  if (officerCommitteeNames.length === 0) {
    return (
      <div className="officer-dashboard officer-dashboard__error">
        Your account is not assigned to a committee.
      </div>
    );
  }

  if (!myCommittee) {
    return (
      <div className="officer-dashboard officer-dashboard__error">
        Could not find a committee matching &quot;{officerCommitteeNames.join(", ")}&quot;.
      </div>
    );
  }

  return (
    <div className="officer-dashboard">
      <div className="officer-dashboard__header">
        {myCommittees.length > 1 ? (
          <select
            className="officer-dashboard__committee-select"
            value={myCommittee.id}
            onChange={(event) => setSelectedCommitteeId(event.target.value)}
            aria-label="Select committee"
          >
            {myCommittees.map((committee) => (
              <option key={committee.id} value={committee.id}>
                {committee.displayName}
              </option>
            ))}
          </select>
        ) : (
          <h2>{myCommittee.displayName}</h2>
        )}
        <span className="officer-dashboard__cycle">Cycle {recruitmentCycle}</span>
        <button
          type="button"
          className="officer-dashboard__edit-questions"
          onClick={() => setIsQuestionsModalOpen(true)}
        >
          Edit Questions
        </button>
      </div>

      <OfficerStatsBar counts={statusCounts} activeStatus={statusFilter} onSelectStatus={handleSelectStatus} />

      <OfficerFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        choiceFilter={choiceFilter}
        onChoiceFilterChange={handleChoiceFilterChange}
        searchInput={searchInput}
        onSearchInputChange={handleSearchInputChange}
      />

      <div className="officer-dashboard__toolbar">
        <div className="officer-dashboard__count">
          {pagination.total} application{pagination.total === 1 ? "" : "s"}
        </div>
        <CopyEmailsButton
          totalCount={pagination.total}
          onFetchAllEmails={handleFetchAllEmails}
          onCopied={handleCopied}
          onError={handleCopyError}
        />
      </div>

      <ApplicationTable
        applications={enrichedApplications}
        onApplicationChanged={handleApplicationChanged}
        onRowClick={setSelectedApplicationId}
      />

      {pagination.pages > 1 && (
        <div className="officer-dashboard__pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      <ApplicationDetailDrawer
        application={selectedApplication}
        onClose={() => setSelectedApplicationId(null)}
        onApplicationChanged={handleApplicationChanged}
      />

      <Toast key={toast.key} showing={toast.visible} message={toast.message} success={toast.success} />

      {isQuestionsModalOpen && (
        <CommitteeQuestionsModal
          committee={myCommittee}
          onClose={() => setIsQuestionsModalOpen(false)}
          onSaved={handleQuestionsSaved}
        />
      )}
    </div>
  );
}
