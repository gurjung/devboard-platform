"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { en } from "@/locales/en";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  const [toggleUrl, setToggleUrl] = React.useState(
    isSignIn ? "/sign-up" : "/sign-in"
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const callback = params.get("callbackUrl");
      const baseTarget = isSignIn ? "/sign-up" : "/sign-in";
      if (callback) {
        setToggleUrl(
          `${baseTarget}?callbackUrl=${encodeURIComponent(callback)}`
        );
      } else {
        setToggleUrl(baseTarget);
      }
    }
  }, [isSignIn]);

  return (
    <main className="bg-neutral-100 min-h-screen">
      <div className="mx-auto max-w-screen-2xl p-4">
        {/* navbar which consist of image tag and button */}
        <nav className="flex justify-between items-center">
          <Image src="/logo.svg" alt="logo" width={152} height={56} />
          <Button variant="secondary">
            <Link href={toggleUrl}>
              {isSignIn
                ? en.auth.layout.signUpToggle
                : en.auth.layout.loginToggle}
            </Link>
          </Button>
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
