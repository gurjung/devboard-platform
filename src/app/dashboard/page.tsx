import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
      <p className="text-muted-foreground">{session.user.email}</p>
      <SignOutButton />
    </div>
  );
}
