"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/Internship/ProtectedRoute";
import CommitteeForm from "@/components/Internship/CommitteeForm";
import createCommittee from "@/app/actions/internship/createCommittee";
import "@/components/Internship/AdminDashboard.scss";

export default function NewCommitteePage() {
  const router = useRouter();

  async function handleSubmit(payload) {
    const result = await createCommittee(payload);
    if (result.success) {
      router.push("/internship/admin");
    }
    return result;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-dashboard">
        <h2>Create Committee</h2>
        <CommitteeForm submitLabel="Create Committee" onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
