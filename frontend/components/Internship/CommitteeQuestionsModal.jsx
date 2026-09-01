"use client";

import { useState } from "react";
import useCustomQuestionsEditor from "@/lib/hooks/useCustomQuestionsEditor";
import CustomQuestionsEditor from "./CustomQuestionsEditor";
import updateCommitteeQuestions from "@/app/actions/internship/updateCommitteeQuestions";
import "@/components/Internship/AdminDashboard.scss";
import "./CommitteeQuestionsModal.scss";

export default function CommitteeQuestionsModal({ committee, onClose, onSaved }) {
  const questionsEditor = useCustomQuestionsEditor(committee.customQuestions);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    const validationError = questionsEditor.validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await updateCommitteeQuestions(committee.id, questionsEditor.toPayload());
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSaved(result.data);
  }

  return (
    <div className="committee-questions-modal-wrapper">
      <div className="committee-questions-modal" role="dialog" aria-modal="true" aria-labelledby="committee-questions-modal-title">
        <div className="committee-questions-modal__header">
          <h3 id="committee-questions-modal-title">Edit {committee.displayName} Questions</h3>
          <button
            type="button"
            className="committee-questions-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="committee-questions-modal__body">
          {error && <div className="committee-form__error">{error}</div>}
          <CustomQuestionsEditor editor={questionsEditor} />
        </div>

        <div className="committee-questions-modal__footer">
          <button
            type="button"
            className="committee-questions-modal__cancel"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="committee-form__submit"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Questions"}
          </button>
        </div>
      </div>
    </div>
  );
}
