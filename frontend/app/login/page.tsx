"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

import loginUser from "@/app/actions/auth/loginUser";
import Banner from "@/components/Banner";
import { authUserProfileAtom } from "@/lib/atoms";
import Config from "@/lib/config";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const setAuthUserProfile = useSetAtom(authUserProfileAtom);

  const handleLogin = async (response: any) => {
    if (!response || !response.credential) return;
    const user = await loginUser(response.credential);
    if (!user) return;
    setAuthUserProfile(user);
    router.push("/home");
  };

  const handleError = () => {
    setError(error ? "Sign in failed." : "");
  };

  return (
    <div className="flex w-full h-full overflow-hidden fixed top-0 left-0">
      <GoogleOAuthProvider clientId={Config.google.clientId}>
        {/* login-sidebar */}
        <div className="relative flex justify-center items-center bg-white h-full text-black text-xs w-2/5 max-w-[750px] min-w-[400px] max-[500px]:w-full">
          {/* banner-container */}
          <div className="absolute top-0 left-0 w-full h-[30%] min-[500px]:hidden">
            <Banner decorative />
          </div>
          {/* login-container */}
          <div className="bg-white p-[100px] flex flex-col [align-items:start] font-[-apple-system,BlinkMacSystemFont,sans-serif] max-[800px]:mt-12">
            <Logo pic="/acm_wordmark_chapter.svg" />
            <h1 className="text-4xl font-semibold mb-4">Member Login</h1>
            <p className="text-base text-gray3 mb-4 leading-[1.75]">
              Access exclusive resources, event registrations, and connect with the largest Computer Science community
              at UCLA.
            </p>
            <p className="text-base text-gray3 mb-5 leading-[1.75]">Please use your UCLA email to sign in.</p>

            <div className="text-center w-full self-center">
              <GoogleLogin
                onSuccess={handleLogin}
                onError={handleError}
                shape="rectangular"
                logo_alignment="center"
                width="250px"
              />
            </div>

            <Link
              className="text-acm-cobalt decoration-0 font-medium text-[0.8rem] mt-12 flex items-center"
              href="https://acm.cs.ucla.edu/">
              Back to ACM website
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-3 w-3 ml-1 fill-acm-cobalt">
                <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
              </svg>
            </Link>

            {error ? (
              <span className="my-[5px] mx-0">
                <b>Error</b>:{error}
              </span>
            ) : (
              <span className="my-[5px] mx-0">&nbsp;</span>
            )}
          </div>
        </div>
      </GoogleOAuthProvider>
      <div className="h-full w-3/5 flex-1 bg-primaryblue max-[500px]:hidden">
        <Banner decorative={false} />
      </div>
    </div>
  );
}
