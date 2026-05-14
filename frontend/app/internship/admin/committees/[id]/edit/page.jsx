"use client";

import { use } from "react";
import ProtectedRoute from "@/components/Internship/ProtectedRoute";

export default function EditCommitteePage({ params }) {
  const { id } = use(params);
  return (
    <ProtectedRoute requiredRole="admin">
      <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2>Edit Committee</h2>
        <p>Committee editor coming soon. Editing committee: <code>{id}</code></p>
      </div>
    </ProtectedRoute>
  );
}
