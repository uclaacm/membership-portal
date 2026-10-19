"use client";

import { memo, useEffect, useRef, useState } from "react";

import updateApplicationReview from "@/app/actions/internship/updateApplicationReview";

const TRUNCATE_LENGTH = 60;

function NotesCell({ applicationId, reviewField, value, onChanged }) {
  const savedValue = value || "";
  const isLong = savedValue.length > TRUNCATE_LENGTH;

  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(savedValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setDraft(savedValue);
  }, [savedValue]);

  // Grow the textarea to fit its full content instead of leaving a fixed
  // row count that clips long notes behind an internal scrollbar.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft, expanded]);

  const handleBlur = async () => {
    const trimmed = draft.trim();
    if (trimmed === savedValue) return;

    setSaving(true);
    setError(null);

    const result = await updateApplicationReview(applicationId, reviewField, trimmed);

    setSaving(false);

    if (!result.success) {
      setError(result.error || "Save failed");
      return;
    }

    onChanged(applicationId, result.data);
  };

  // Long, unedited notes collapse to a preview with a "Read more" toggle;
  // short notes (or once expanded) show a directly-editable textarea.
  if (isLong && !expanded) {
    return (
      <div className="notes-cell">
        <p className="notes-cell__preview">{savedValue.slice(0, TRUNCATE_LENGTH)}…</p>
        <button type="button" className="notes-cell__toggle" onClick={() => setExpanded(true)}>
          Read more
        </button>
      </div>
    );
  }

  return (
    <div className="notes-cell">
      <textarea
        ref={textareaRef}
        className="notes-cell__textarea"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleBlur}
        disabled={saving}
        rows={2}
        placeholder="Add a note…"
      />
      {isLong && (
        <button type="button" className="notes-cell__toggle" onClick={() => setExpanded(false)}>
          Show less
        </button>
      )}
      {error && <span className="notes-cell__error">{error}</span>}
    </div>
  );
}

export default memo(NotesCell);
