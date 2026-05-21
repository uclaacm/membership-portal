"use client";

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";

import fetchOwnApplication from "@/app/actions/internship/fetchOwnApplication";
import ApplicationWizard from "@/components/Internship/ApplicationWizard";
import OfficerIneligibilityMessage from "@/components/Internship/OfficerIneligibilityMessage";
import { isAdminAtom, isOfficerAtom, myApplicationAtom } from "@/lib/atoms";

export default function ApplyPage() {
  const isAdmin = useAtomValue(isAdminAtom);
  const isOfficer = useAtomValue(isOfficerAtom);
  const myApplication = useAtomValue(myApplicationAtom);
  const setMyApplication = useSetAtom(myApplicationAtom);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAdmin || isOfficer) return;

    fetchOwnApplication().then(result => {
      if (result.success) {
        setMyApplication(result.data);
      }
    });
  }, [mounted, isAdmin, isOfficer, setMyApplication]);

  useEffect(() => {
    if (!mounted) return;
    if (myApplication?.submissionStatus === "submitted") {
      router.replace("/internship");
    }
  }, [mounted, myApplication, router]);

  if (!mounted) return null;
  if (isAdmin || isOfficer) return <OfficerIneligibilityMessage />;
  if (myApplication?.submissionStatus === "submitted") return null;

  return <ApplicationWizard />;
}
