"use client";

import { useState } from "react";
import { downloadCsv } from "@/lib/spreadsheet";
import "./ExportSpreadsheetButton.scss";

// `onFetchRows` returns a header row followed by one row per application, covering
// every page that matches the current filters rather than just the page on screen.
export default function ExportSpreadsheetButton({ totalCount, fileName, onFetchRows, onExported, onError }) {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    setExporting(true);
    try {
      const rows = await onFetchRows();
      if (rows.length <= 1) {
        onError?.("No applications to export");
        return;
      }
      downloadCsv(fileName, rows);
      onExported?.(rows.length - 1);
    } catch (error) {
      onError?.((error && error.message) || "Couldn't export applications");
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      className="export-spreadsheet-button"
      onClick={handleClick}
      disabled={exporting || totalCount === 0}
    >
      {exporting ? "Exporting…" : "Export to Spreadsheet"}
    </button>
  );
}
