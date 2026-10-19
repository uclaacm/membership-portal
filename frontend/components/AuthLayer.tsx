import { cookies } from "next/headers";
import fetchUser from "@/app/actions/user/fetchUser";
import AuthSync from "@/components/AuthSync";

export default async function AuthLayer({ children }: { children: React.ReactNode }) {
  const cks = await cookies();
  const token = cks.get("token")?.value ?? null;
  const session = token
    ? await fetchUser()
    : { user: null, unauthorized: false };

  // The cookie cannot be cleared here — a Server Component may not mutate cookies — so the
  // rejected-session signal is handed to AuthSync, which clears it on the client.
  return (
    <>
      <AuthSync user={session.user} unauthorized={session.unauthorized} />
      {children}
    </>
  );
}
