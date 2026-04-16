import { cookies } from "next/headers";
import fetchUser from "@/app/actions/user/fetchUser";
import AuthSync from "@/components/AuthSync";

export default async function AuthLayer({ children }: { children: React.ReactNode }) {
  const cks = await cookies();
  const token = cks.get("token")?.value ?? null;
  const user = token ? await fetchUser() : null;

  return (
    <>
      <AuthSync user={user} />
      {children}
    </>
  );
}
