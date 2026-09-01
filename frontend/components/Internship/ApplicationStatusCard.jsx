"use client";

import { useAtomValue } from "jotai";
import Link from "next/link";
import { myApplicationAtom, activeCommitteesAtom } from "@/lib/atoms";
import useResolvedCommitteeNames, { getCommitteeDisplayName } from "@/lib/hooks/useResolvedCommitteeNames";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import "./style.scss";

export default function ApplicationStatusCard() {
  const myApplication = useAtomValue(myApplicationAtom);
  const activeCommittees = useAtomValue(activeCommitteesAtom);
  const committees = activeCommittees ?? [];

  const applicationCommitteeIds = myApplication
    ? [
        myApplication.firstChoiceCommittee,
        myApplication.secondChoiceCommittee,
        myApplication.thirdChoiceCommittee,
      ].filter(Boolean)
    : [];
  const resolvedNames = useResolvedCommitteeNames(applicationCommitteeIds, committees);

  function renderApplicationWizardLink(label) {
    return (
      <Link href="/internship/apply" className="application-status-card__button">
        {label}
      </Link>
    );
  }

  // Branch 0: Loading
  if (activeCommittees === null) {
    return (
      <div className="application-status-card">
        <h3 className="application-status-card__title">My Application</h3>
        <div className="application-status-card__content">
          <p className="application-status-card__loading">Loading...</p>
        </div>
      </div>
    );
  }

  // Branch 1: Open, no application
  if (!myApplication && committees.length > 0) {
    return (
      <div className="application-status-card">
        <h3 className="application-status-card__title">My Application</h3>
        <div className="application-status-card__content">
          <div className="application-status-card__banner">
            Applications are open
          </div>
          <div className="application-status-card__cta">
            {renderApplicationWizardLink("Start Application")}
          </div>
        </div>
      </div>
    );
  }

  // Branch 2: Draft
  if (myApplication && myApplication.submissionStatus !== "submitted") {
    const firstName = getCommitteeDisplayName(committees, resolvedNames, myApplication.firstChoiceCommittee);
    const secondName = getCommitteeDisplayName(committees, resolvedNames, myApplication.secondChoiceCommittee);
    const thirdName = getCommitteeDisplayName(committees, resolvedNames, myApplication.thirdChoiceCommittee);

    return (
      <div className="application-status-card">
        <h3 className="application-status-card__title">My Application</h3>
        <div className="application-status-card__content">
          <div className="application-status-card__committee-chips">
            {firstName && <span className="committee-chip">{firstName}</span>}
            {secondName && <span className="committee-chip">{secondName}</span>}
            {thirdName && <span className="committee-chip">{thirdName}</span>}
          </div>
          <div className="application-status-card__cta">
            {renderApplicationWizardLink("Continue Application")}
          </div>
          {myApplication.lastModifiedAt && (
            <p className="application-status-card__timestamp">
              Last saved: {new Date(myApplication.lastModifiedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Branch 3: Submitted
  if (myApplication && myApplication.submissionStatus === "submitted") {
    const choices = [
      {
        committeeId: myApplication.firstChoiceCommittee,
        status: myApplication.firstChoiceStatus,
      },
      {
        committeeId: myApplication.secondChoiceCommittee,
        status: myApplication.secondChoiceStatus,
      },
      {
        committeeId: myApplication.thirdChoiceCommittee,
        status: myApplication.thirdChoiceStatus,
      },
    ].filter((c) => c.committeeId);

    return (
      <div className="application-status-card">
        <h3 className="application-status-card__title">My Application</h3>
        <div className="application-status-card__content">
          <div className="application-status-card__confirmation">
            <span className="status-badge status-badge--submitted">
              Submitted
            </span>
          </div>
          <div className="application-status-card__status-list">
            {choices.map((choice, index) => (
              <ApplicationStatusBadge
                key={index}
                status={choice.status}
                committeeName={getCommitteeDisplayName(committees, resolvedNames, choice.committeeId)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Branch 4: Closed, no application
  return (
    <div className="application-status-card">
      <h3 className="application-status-card__title">My Application</h3>
      <div className="application-status-card__content">
        <p className="application-status-card__closed">
          Applications are closed for this cycle
        </p>
      </div>
    </div>
  );
}
