"use client";

import { useState } from "react";

let clientIdCounter = 0;
function makeClientId() {
  clientIdCounter += 1;
  return `q-${clientIdCounter}`;
}

function slugify(text) {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function uniqueKey(base, takenKeys) {
  const root = base || "question";
  if (!takenKeys.has(root)) return root;
  let i = 2;
  while (takenKeys.has(`${root}_${i}`)) i += 1;
  return `${root}_${i}`;
}

// Shared editing state/logic for a committee's customQuestions array — used
// by the admin committee form (full committee edit) and the officer's
// questions-only editor (PUT /committees/:id/questions), so both stay in
// sync on validation, key auto-generation, and payload shape.
export default function useCustomQuestionsEditor(initialQuestions) {
  const [questions, setQuestions] = useState(() => (
    (initialQuestions ?? []).map((q) => ({
      clientId: makeClientId(),
      questionKey: q.questionKey ?? "",
      questionText: q.questionText ?? "",
      questionType: q.questionType ?? "short_text",
      required: q.required ?? true,
      choices: Array.isArray(q.choices) ? q.choices : [],
      // Existing questions keep their key stable even if the text is edited —
      // applicant responses are stored against questionKey, so changing it
      // on an edit would orphan any answers already saved against it.
      keyTouched: true,
    }))
  ));

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        clientId: makeClientId(),
        questionKey: "",
        questionText: "",
        questionType: "short_text",
        required: true,
        choices: [],
        keyTouched: false,
      },
    ]);
  }

  function updateQuestion(clientId, patch) {
    setQuestions((prev) => prev.map((q) => (q.clientId === clientId ? { ...q, ...patch } : q)));
  }

  function handleQuestionTextChange(clientId, text) {
    setQuestions((prev) => prev.map((q) => {
      if (q.clientId !== clientId) return q;
      if (q.keyTouched) return { ...q, questionText: text };
      const takenKeys = new Set(
        prev.filter((other) => other.clientId !== clientId).map((other) => other.questionKey),
      );
      return { ...q, questionText: text, questionKey: uniqueKey(slugify(text), takenKeys) };
    }));
  }

  function removeQuestion(clientId) {
    setQuestions((prev) => prev.filter((q) => q.clientId !== clientId));
  }

  function moveQuestion(clientId, direction) {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.clientId === clientId);
      const swapWith = idx + direction;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  }

  function addChoice(clientId, choiceText) {
    setQuestions((prev) => prev.map((q) => (
      q.clientId === clientId && !q.choices.includes(choiceText)
        ? { ...q, choices: [...q.choices, choiceText] }
        : q
    )));
  }

  function removeChoice(clientId, choice) {
    setQuestions((prev) => prev.map((q) => (
      q.clientId === clientId ? { ...q, choices: q.choices.filter((c) => c !== choice) } : q
    )));
  }

  function validate() {
    if (questions.some((q) => !q.questionText.trim() || !q.questionKey.trim())) {
      return "Every custom question needs both a key and question text.";
    }
    const keys = questions.map((q) => q.questionKey.trim());
    if (new Set(keys).size !== keys.length) {
      return "Custom question keys must be unique.";
    }
    return null;
  }

  function toPayload() {
    return questions.map((q, index) => ({
      questionKey: q.questionKey.trim(),
      questionText: q.questionText.trim(),
      questionType: q.questionType,
      required: q.required,
      order: index,
      choices: q.questionType === "multiple_choice" ? q.choices : [],
    }));
  }

  return {
    questions,
    addQuestion,
    updateQuestion,
    handleQuestionTextChange,
    removeQuestion,
    moveQuestion,
    addChoice,
    removeChoice,
    validate,
    toPayload,
  };
}
