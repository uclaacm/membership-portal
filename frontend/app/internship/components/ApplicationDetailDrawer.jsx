"use client";

import StatusUpdateDropdown from "./StatusUpdateDropdown";

const CHOICE_RANK_LABELS = { 1: "1st Choice", 2: "2nd Choice", 3: "3rd Choice" };

export default function ApplicationDetailDrawer({ application, onClose, onApplicationChanged }) {
  if (!application) return null;

  return (
    <div className="application-detail-drawer__overlay" onClick={onClose}>
      <div
        className="application-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-detail-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="application-detail-drawer__header">
          <h3 id="application-detail-drawer-title">{application.firstName} {application.lastName}</h3>
          <button
            type="button"
            className="application-detail-drawer__close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <section className="application-detail-drawer__section">
          <h4>Candidate Profile</h4>
          <dl className="application-detail-drawer__profile">
            <div>
              <dt>Email</dt>
              <dd>{application.email}</dd>
            </div>
            {application.phone && (
              <div>
                <dt>Phone</dt>
                <dd>{application.phone}</dd>
              </div>
            )}
            <div>
              <dt>University</dt>
              <dd>{application.university}</dd>
            </div>
            <div>
              <dt>Major</dt>
              <dd>{application.major}</dd>
            </div>
            <div>
              <dt>Graduation Year</dt>
              <dd>{application.graduationYear ?? "—"}</dd>
            </div>
            <div>
              <dt>Resume</dt>
              <dd>
                {application.resumeUrl ? (
                  <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                    View resume
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="application-detail-drawer__section">
          <div className="application-detail-drawer__status-row">
            <h4>{CHOICE_RANK_LABELS[application.myChoiceRank] ?? "Status"}</h4>
            <StatusUpdateDropdown
              applicationId={application._id}
              statusField={application.myStatusField}
              status={application.myStatus}
              onChanged={onApplicationChanged}
            />
          </div>
        </section>

        <section className="application-detail-drawer__section">
          <h4>Committee Responses</h4>
          {application.myResponses.length === 0 ? (
            <p className="application-detail-drawer__empty">No responses submitted.</p>
          ) : (
            <dl className="application-detail-drawer__responses">
              {application.myResponses.map((response) => (
                <div key={response.questionKey}>
                  <dt>{response.question}</dt>
                  <dd>{response.answer}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>
    </div>
  );
}
