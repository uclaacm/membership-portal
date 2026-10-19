"use client";

import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import AdminDashboard from "@/components/Internship/AdminDashboard";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}
