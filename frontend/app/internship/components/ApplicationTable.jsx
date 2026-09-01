"use client";

import { memo } from "react";

import NotesCell from "./NotesCell";
import RatingDropdown from "./RatingDropdown";
import StatusUpdateDropdown from "./StatusUpdateDropdown";

const CHOICE_RANK_LABELS = { 1: "1st Choice", 2: "2nd Choice", 3: "3rd Choice" };

function ApplicationRow({ application, onApplicationChanged, onRowClick }) {
  return (
    <tr className="officer-application-table__row" onClick={() => onRowClick(application._id)}>
      <td>{application.firstName} {application.lastName}</td>
      <td className="officer-application-table__email-col">{application.email}</td>
      <td>{application.graduationYear ?? "—"}</td>
      <td>{application.major}</td>
      <td>{CHOICE_RANK_LABELS[application.myChoiceRank] ?? "—"}</td>
      <td onClick={(event) => event.stopPropagation()}>
        <StatusUpdateDropdown
          applicationId={application._id}
          statusField={application.myStatusField}
          status={application.myStatus}
          onChanged={onApplicationChanged}
        />
      </td>
      <td onClick={(event) => event.stopPropagation()}>
        <RatingDropdown
          applicationId={application._id}
          reviewField={application.myOfficer1RatingField}
          value={application.myOfficer1Rating}
          onChanged={onApplicationChanged}
        />
      </td>
      <td onClick={(event) => event.stopPropagation()}>
        <RatingDropdown
          applicationId={application._id}
          reviewField={application.myOfficer2RatingField}
          value={application.myOfficer2Rating}
          onChanged={onApplicationChanged}
        />
      </td>
      <td className="officer-application-table__notes-col" onClick={(event) => event.stopPropagation()}>
        <NotesCell
          applicationId={application._id}
          reviewField={application.myNotesField}
          value={application.myNotes}
          onChanged={onApplicationChanged}
        />
      </td>
    </tr>
  );
}

const MemoApplicationRow = memo(ApplicationRow);

export default function ApplicationTable({ applications, onApplicationChanged, onRowClick }) {
  if (applications.length === 0) {
    return (
      <div className="officer-application-table__empty">
        No applications match the current filters.
      </div>
    );
  }

  return (
    <div className="officer-application-table__scroll">
      <table className="officer-application-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Year</th>
            <th>Major</th>
            <th>Choice Rank</th>
            <th>Status</th>
            <th>Officer 1</th>
            <th>Officer 2</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <MemoApplicationRow
              key={application._id}
              application={application}
              onApplicationChanged={onApplicationChanged}
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
