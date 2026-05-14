"use client";

import { useAtomValue } from "jotai";
import { myApplicationAtom } from "@/lib/atoms";
import "./style.scss";

export default function ApplicationStatusCard() {
  const myApplication = useAtomValue(myApplicationAtom);

  return (
    <div className="application-status-card">
      <h3 className="application-status-card__title">My Application</h3>
      <div className="application-status-card__content">
        {myApplication ? (
          <p>Application exists (Phase 2 implementation)</p>
        ) : (
          <p>No application data loaded</p>
        )}
      </div>
    </div>
  );
}
