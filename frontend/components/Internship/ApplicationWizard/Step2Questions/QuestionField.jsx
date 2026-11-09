"use client";

export default function QuestionField({ question, value, onChange }) {
  const currentValue = value ?? "";
  const inputClass =
    "mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600";

  let field;
  if (question.questionType === "short_text") {
    field = (
      <input
        type="text"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    );
  } else if (question.questionType === "long_text") {
    const atLimit = currentValue.length >= 2000;
    field = (
      <div className="space-y-1">
        <textarea
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          maxLength={2000}
          rows={5}
          className={inputClass}
        />
        <div className={`text-xs ${atLimit ? "text-red-600" : "text-slate-500"}`}>
          {currentValue.length} / 2000
        </div>
      </div>
    );
  } else if (question.questionType === "multiple_choice") {
    if (!question.choices || question.choices.length === 0) {
      field = <p className="text-sm italic text-slate-500">(no choices configured)</p>;
    } else {
      field = (
        <div className="mt-1 space-y-2">
          {question.choices.map((choice) => (
            <label key={choice} className="flex items-center gap-2">
              <input
                type="radio"
                name={question.questionKey}
                value={choice}
                checked={currentValue === choice}
                onChange={() => onChange(choice)}
              />
              <span className="text-sm text-slate-800">{choice}</span>
            </label>
          ))}
        </div>
      );
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {question.questionText}
        {question.required && <span className="text-red-600">*</span>}
      </label>
      {field}
    </div>
  );
}
