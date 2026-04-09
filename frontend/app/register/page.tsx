"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BannerMessage from "@/components/BannerMessage";
import Banner from "@/components/BannerJS/banner";
import registerUser from "@/app/actions/auth/registerUser";
import RegisterSidebar from "./registerSidebar";
import SuccessCard from "./successCard";
import "@/app/login/style.scss";
import "./style.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ year: 0, major: "" });
  const [disableForm, setDisableForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const profileValid = () => !!(profile.major && profile.year > 0);

  const handleProfileChange = (name: "year" | "major", value: string | number) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    if (disableForm || !profileValid()) return;

    setDisableForm(true);
    setError(null);

    const ok = await registerUser(profile);
    if (ok) {
      setSuccess(true);
      setTimeout(() => router.push("/home"), 1500);
    } else {
      setError("Registration failed. Please try again.");
      setDisableForm(false);
    }
  };

  return (
    <div>
      <BannerMessage showing={!!error} success={false} message={error} />
      <div className="login">
        {success ? (
          <SuccessCard />
        ) : (
          <RegisterSidebar
            profile={profile}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
            disableForm={disableForm}
            profileValid={profileValid}
          />
        )}
        <div className="login-tile">
          <Banner decorative={false} />
        </div>
      </div>
    </div>
  );
}
