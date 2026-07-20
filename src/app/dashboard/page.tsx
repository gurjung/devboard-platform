import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { AUTH_ROUTES } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(AUTH_ROUTES.signIn);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-muted-foreground">{session.user.email}</p>
      <SignOutButton />
    </div>
  );
}
