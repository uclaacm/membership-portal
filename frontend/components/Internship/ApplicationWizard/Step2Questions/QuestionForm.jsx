"use client";

import QuestionField from "./QuestionField";

export default function QuestionForm({ questions, responses, onAnswerChange }) {
  const sortedQuestions = [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const answerByKey = new Map(responses.map((r) => [r.questionKey, r.answer]));

  if (sortedQuestions.length === 0) {
    return (
      <p className="text-sm italic text-slate-500">
        This committee has no application questions.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sortedQuestions.map((q) => (
        <QuestionField
          key={q.questionKey}
          question={q}
          value={answerByKey.get(q.questionKey) ?? ""}
          onChange={(a) => onAnswerChange(q.questionKey, a)}
        />
      ))}
    </div>
  );
}
