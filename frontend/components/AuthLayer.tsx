import { cookies } from "next/headers";

import AuthSync from "@/components/AuthSync";

export default async function AuthLayer({ children }: { children: React.ReactNode }) {
  const cks = await cookies();
  const token = cks.get("token")?.value ?? null;

  return (
    <>
      <AuthSync token={token} />
      {children}
    </>
  );
}
