"use client";

import { useId } from "react";
import "./style.scss";

// A visually hidden native checkbox with role="switch", so keyboard and screen readers work.
// `hideDescription` keeps the description off screen but still announced.
export default function Switch({
  checked,
  onChange,
  label,
  description,
  hideDescription = false,
  disabled = false,
  className = "",
}) {
  const descriptionId = useId();

  return (
    <label className={`switch${disabled ? " switch--disabled" : ""}${className ? ` ${className}` : ""}`}>
      <input
        type="checkbox"
        role="switch"
        className="switch__input"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        aria-describedby={description ? descriptionId : undefined}
      />
      <span className="switch__track" aria-hidden="true" />
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {description && (
          <span id={descriptionId} className={hideDescription ? "switch__description--hidden" : "switch__description"}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
