"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import LoginSidebar from './loginSidebar';
import Banner from './banner';
import loginUser from '@/app/actions/auth/loginUser';
import { authUserProfileAtom } from '@/lib/atoms';
import './style.scss';

export default function LoginPage() {
  const router = useRouter();
  const setAuthUserProfile = useSetAtom(authUserProfileAtom);

  const handleLogin = async (token) => {
    const user = await loginUser(token);
    if (!user) return;
    setAuthUserProfile(user);
    router.push('/home');
  };

  return (
    <div className="login">
      <LoginSidebar onsubmit={handleLogin} />
      <div className="login-tile">
        <Banner decorative={false} />
      </div>
    </div>
  );
}
