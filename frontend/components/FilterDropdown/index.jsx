'use client';

import React, { useState, useRef, useEffect } from 'react';
import './style.scss';

/**
 * Reusable dropdown filter component.
 *
 * @param {string} label - Placeholder text shown when nothing is selected.
 * @param {Array<string|{value: string, label: string}>} options - Items to display.
 * @param {string[]} selected - Currently selected values (controlled).
 * @param {(values: string[]) => void} onChange - Called with the new selection array.
 * @param {boolean} multiSelect - If true, allows multiple selections with checkboxes.
 */
export default function FilterDropdown({
  label,
  options = [],
  selected = [],
  onChange,
  multiSelect = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    if (multiSelect) {
      const next = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onChange(next);
    } else {
      onChange(selected.includes(value) ? [] : [value]);
      setOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const getDisplayLabel = () => {
    if (selected.length === 0) return label;
    const selectedLabels = selected.map((val) => {
      const opt = options.find((o) => (typeof o === 'string' ? o : o.value) === val);
      return opt ? (typeof opt === 'string' ? opt : opt.label) : val;
    });
    return selectedLabels.join(', ');
  };
  const displayLabel = getDisplayLabel();

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        type="button"
        className={`filter-dropdown-toggle ${open ? 'open' : ''} ${selected.length > 0 ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span className="filter-dropdown-label">{displayLabel}</span>
        {selected.length > 0 && (
          <span className="filter-dropdown-clear" onClick={handleClear}>
            &times;
          </span>
        )}
        <i className={`fa fa-chevron-down filter-dropdown-chevron ${open ? 'rotated' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="filter-dropdown-menu">
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            const isSelected = selected.includes(value);
            return (
              <li
                key={value}
                className={`filter-dropdown-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(value)}
              >
                {multiSelect && (
                  <span className={`filter-dropdown-check ${isSelected ? 'checked' : ''}`} />
                )}
                <span>{optLabel}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
