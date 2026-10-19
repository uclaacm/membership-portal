"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { isAdminAtom, isOfficerAtom } from "@/lib/atoms";
import AdminDashboard from "@/components/Internship/AdminDashboard";
import OfficerDashboard from "@/components/Internship/OfficerDashboard";
import MemberDashboard from "@/components/Internship/MemberDashboard";
import DashboardSkeleton from "@/components/Internship/DashboardSkeleton";

export default function InternshipPage() {
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) return <DashboardSkeleton />;

  if (isAdmin) return <AdminDashboard />;
  if (isOfficer) return <OfficerDashboard />;
  return <MemberDashboard />;
}
