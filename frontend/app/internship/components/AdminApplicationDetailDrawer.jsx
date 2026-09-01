"use client";

import StatusUpdateDropdown from "./StatusUpdateDropdown";
import "@/components/Internship/OfficerDashboard.scss";

const CHOICE_FIELDS = [
  {
    rank: 1,
    label: "1st Choice",
    committeeField: "firstChoiceCommittee",
    statusField: "firstChoiceStatus",
    responsesField: "firstChoiceResponses",
  },
  {
    rank: 2,
    label: "2nd Choice",
    committeeField: "secondChoiceCommittee",
    statusField: "secondChoiceStatus",
    responsesField: "secondChoiceResponses",
  },
  {
    rank: 3,
    label: "3rd Choice",
    committeeField: "thirdChoiceCommittee",
    statusField: "thirdChoiceStatus",
    responsesField: "thirdChoiceResponses",
  },
];


export default function AdminApplicationDetailDrawer({ application, committees, onClose, onApplicationChanged }) {
  if (!application) return null;

  const committeeLookup = new Map(committees.map((c) => [c.id ?? c._id, c.displayName ?? c.name]));

  const choices = CHOICE_FIELDS
    .map((choice) => ({ ...choice, committeeId: application[choice.committeeField] }))
    .filter((choice) => choice.committeeId);

  return (
    <div className="application-detail-drawer__overlay" onClick={onClose}>
      <div
        className="application-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-application-detail-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="application-detail-drawer__header">
          <h3 id="admin-application-detail-drawer-title">{application.firstName} {application.lastName}</h3>
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

        {choices.map((choice) => {
          const responses = Array.isArray(application[choice.responsesField])
            ? application[choice.responsesField]
            : [];
          const committeeName = committeeLookup.get(choice.committeeId) ?? choice.committeeId;

          return (
            <section key={choice.rank} className="application-detail-drawer__section">
              <div className="application-detail-drawer__status-row">
                <h4>{choice.label} — {committeeName}</h4>
                <StatusUpdateDropdown
                  applicationId={application._id}
                  statusField={choice.statusField}
                  status={application[choice.statusField]}
                  onChanged={onApplicationChanged}
                />
              </div>

              <h4>Committee Responses</h4>
              {responses.length === 0 ? (
                <p className="application-detail-drawer__empty">No responses submitted.</p>
              ) : (
                <dl className="application-detail-drawer__responses">
                  {responses.map((response) => (
                    <div key={response.questionKey}>
                      <dt>{response.question}</dt>
                      <dd>{response.answer}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
