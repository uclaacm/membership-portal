"use client";

import { useState } from "react";

// `onFetchAllEmails` (not a static `applications` array) because the
// underlying application list is now server-paginated — "copy all matching
// emails" has to walk every page under the current filters, not just
// whichever page happens to be on screen.
export default function CopyEmailsButton({ totalCount, onFetchAllEmails, onCopied, onError }) {
  const [copying, setCopying] = useState(false);

  const handleClick = async () => {
    setCopying(true);
    try {
      const emails = await onFetchAllEmails();
      if (emails.length === 0) {
        setCopying(false);
        return;
      }
      await navigator.clipboard.writeText(emails.join(", "));
      onCopied(emails.length);
    } catch (err) {
      onError((err && err.message) || "Couldn't copy emails to clipboard");
    } finally {
      setCopying(false);
    }
  };

  return (
    <button
      type="button"
      className="copy-emails-button"
      onClick={handleClick}
      disabled={copying || totalCount === 0}
    >
      {copying ? "Copying…" : `Copy Emails (${totalCount})`}
    </button>
  );
}
