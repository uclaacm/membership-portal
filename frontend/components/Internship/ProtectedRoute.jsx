"use client";

import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { isAdminAtom, isOfficerAtom } from "@/lib/atoms";

export default function ProtectedRoute({ children, requiredRole }) {
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (requiredRole === "officer" && !isAdmin && !isOfficer) {
      router.replace("/internship");
      return;
    }

    if (requiredRole === "admin" && !isAdmin) {
      router.replace(isOfficer ? "/internship/officer" : "/internship");
    }
  }, [mounted, isAdmin, isOfficer, requiredRole, router]);

  if (!mounted) return null;
  if (requiredRole === "officer" && !isAdmin && !isOfficer) return null;
  if (requiredRole === "admin" && !isAdmin) return null;

  return children;
}
