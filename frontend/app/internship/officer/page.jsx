"use client";

import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import OfficerDashboard from "@/components/Internship/OfficerDashboard";

export default function OfficerPage() {
  return (
    <ProtectedRoute requiredRole="officer">
      <OfficerDashboard />
    </ProtectedRoute>
  );
}
