"use client";

import { useState } from "react";

const QUESTION_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "multiple_choice", label: "Multiple choice" },
];

function QuestionChoices({ choices, onAdd, onRemove }) {
  const [input, setInput] = useState("");

  function commit() {
    const trimmed = input.trim();
    if (trimmed) onAdd(trimmed);
    setInput("");
  }

  return (
    <div className="committee-form__choices">
      <div className="committee-form__choice-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="Add a choice and press Enter"
        />
        <button type="button" onClick={commit}>
          Add
        </button>
      </div>
      {choices.length > 0 && (
        <div className="committee-form__choice-tags">
          {choices.map((choice) => (
            <span key={choice} className="committee-form__choice-tag">
              {choice}
              <button type="button" aria-label={`Remove ${choice}`} onClick={() => onRemove(choice)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Renders the add/edit/reorder UI for a committee's customQuestions, driven
// by the state + handlers from useCustomQuestionsEditor. Shared between the
// admin committee form and the officer's questions-only editor.
export default function CustomQuestionsEditor({ editor }) {
  const {
    questions,
    addQuestion,
    updateQuestion,
    handleQuestionTextChange,
    removeQuestion,
    moveQuestion,
    addChoice,
    removeChoice,
  } = editor;

  return (
    <div className="committee-form__field">
      <div className="committee-form__questions-header">
        <span className="committee-form__label">Custom Questions</span>
        <button type="button" className="committee-form__question-add" onClick={addQuestion}>
          Add Question
        </button>
      </div>

      {questions.length === 0 && (
        <span className="committee-form__hint">No custom questions yet.</span>
      )}

      {questions.map((question, index) => (
        <div key={question.clientId} className="committee-form__question">
          <div className="committee-form__question-row">
            <span className="committee-form__question-index">{index + 1}.</span>
            <input
              type="text"
              value={question.questionText}
              onChange={(e) => handleQuestionTextChange(question.clientId, e.target.value)}
              placeholder="Question text"
              className="committee-form__question-text"
              required
            />
            <button
              type="button"
              onClick={() => moveQuestion(question.clientId, -1)}
              disabled={index === 0}
              aria-label="Move question up"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveQuestion(question.clientId, 1)}
              disabled={index === questions.length - 1}
              aria-label="Move question down"
            >
              ↓
            </button>
            <button
              type="button"
              className="committee-form__question-remove"
              aria-label="Remove question"
              onClick={() => removeQuestion(question.clientId)}
            >
              ×
            </button>
          </div>

          <div className="committee-form__question-row committee-form__question-row--meta">
            <label className="committee-form__question-type">
              <span>Type</span>
              <select
                value={question.questionType}
                onChange={(e) => updateQuestion(question.clientId, { questionType: e.target.value })}
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>

            <label className="committee-form__question-required">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.clientId, { required: e.target.checked })}
              />
              <span>Required</span>
            </label>
          </div>

          {question.questionType === "multiple_choice" && (
            <QuestionChoices
              choices={question.choices}
              onAdd={(choice) => addChoice(question.clientId, choice)}
              onRemove={(choice) => removeChoice(question.clientId, choice)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
