import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/constants";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect(AUTH_ROUTES.dashboard);
  } else {
    redirect(AUTH_ROUTES.signIn);
  }
}
