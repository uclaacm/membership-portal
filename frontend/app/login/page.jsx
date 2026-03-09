"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import LoginSidebar from './loginSidebar';
import Banner from '../../components/BannerJS/banner';
import loginUser from '@/app/actions/auth/loginUser';
import { authUserProfileAtom } from '@/lib/atoms';
import { isTokenRegistered } from '@/lib/token';
import CookieStore from '@/lib/cookieStore';
import './style.scss';

export default function LoginPage() {
  const router = useRouter();
  const setAuthUserProfile = useSetAtom(authUserProfileAtom);
  const [loginError, setLoginError] = React.useState(null);

  const handleLogin = async (token) => {
    setLoginError(null);
    const result = await loginUser(token);
    if ('error' in result) {
      setLoginError(result.error);
      return;
    }
    setAuthUserProfile(result.user);
    
    // Check if user is registered by reading the token
    const authToken = CookieStore.get('token');
    if (authToken && !isTokenRegistered(authToken)) {
      router.push('/register');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="login">
      <LoginSidebar onsubmit={handleLogin} loginError={loginError} />
      <div className="login-tile">
        <Banner decorative={false} />
      </div>
    </div>
  );
}
