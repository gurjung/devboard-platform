import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect(AUTH_ROUTES.signIn);
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
