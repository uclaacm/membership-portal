"use client";

export default function BulkActionBar({ selectedCount, onOpen, onClose, onClear, disabled }) {
  return (
    <div className="bulk-action-bar">
      <span className="bulk-action-bar__count">
        {selectedCount} selected
      </span>
      <button type="button" className="bulk-action-bar__clear" onClick={onClear} disabled={disabled}>
        Clear
      </button>
      <div className="bulk-action-bar__actions">
        <button type="button" className="bulk-action-bar__btn" onClick={onOpen} disabled={disabled}>
          Open Selected
        </button>
        <button type="button" className="bulk-action-bar__btn" onClick={onClose} disabled={disabled}>
          Close Selected
        </button>
      </div>
    </div>
  );
}
