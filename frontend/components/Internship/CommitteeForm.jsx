"use client";

import { useState } from "react";
import useCustomQuestionsEditor from "@/lib/hooks/useCustomQuestionsEditor";
import CustomQuestionsEditor from "./CustomQuestionsEditor";

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function CommitteeForm({ initialValues, submitLabel, onSubmit }) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [internLimit, setInternLimit] = useState(
    initialValues?.internLimit != null ? String(initialValues.internLimit) : "",
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    toDateInputValue(initialValues?.applicationDeadline),
  );
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const questionsEditor = useCustomQuestionsEditor(initialValues?.customQuestions);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const questionsError = questionsEditor.validate();
    if (questionsError) {
      setError(questionsError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const trimmedName = name.trim();
    const payload = {
      name: trimmedName,
      displayName: trimmedName,
      description: description.trim() || undefined,
      internLimit: internLimit.trim() ? Number(internLimit) : undefined,
      applicationDeadline: applicationDeadline || undefined,
      isActive,
      customQuestions: questionsEditor.toPayload(),
    };

    const result = await onSubmit(payload);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  }

  return (
    <form className="committee-form" onSubmit={handleSubmit}>
      {error && <div className="committee-form__error">{error}</div>}

      <label className="committee-form__field">
        <span className="committee-form__label">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Hack"
          required
        />
        <span className="committee-form__hint">
          Used to match officer role assignments — keep this stable once applications exist.
        </span>
      </label>

      <label className="committee-form__field">
        <span className="committee-form__label">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </label>

      <CustomQuestionsEditor editor={questionsEditor} />

      <label className="committee-form__field committee-form__field--inline">
        <span className="committee-form__label">Intern Limit</span>
        <input
          type="number"
          min="0"
          value={internLimit}
          onChange={(e) => setInternLimit(e.target.value)}
          placeholder="No limit"
        />
      </label>

      <label className="committee-form__field committee-form__field--inline">
        <span className="committee-form__label">Application Deadline</span>
        <input
          type="date"
          value={applicationDeadline}
          onChange={(e) => setApplicationDeadline(e.target.value)}
        />
      </label>

      <label className="committee-form__field committee-form__field--checkbox">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Active (accepting applications)</span>
      </label>

      <div className="committee-form__actions">
        <button type="submit" className="committee-form__submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
