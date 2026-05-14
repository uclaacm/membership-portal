"use client";

import ProtectedRoute from "@/components/Internship/ProtectedRoute";

export default function NewCommitteePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
        <h2>Create Committee</h2>
        <p>Committee editor coming soon.</p>
      </div>
    </ProtectedRoute>
  );
}
