"use client";

import React from "react";
import { en } from "@/locales/en";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { registerSchema, type RegisterInput } from "@/features/auth/schema";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useRegister } from "@/features/auth/hooks/use-register";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { SocialAuthButtons } from "./social-auth-buttons";

const SignUpCard = () => {
  const registerMutation = useRegister();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const signInUrl = rawCallbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`
    : "/sign-in";

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, {
      onSuccess: async () => {
        toast.success(en.auth.signUp.toastSuccess);

        // Automatically sign in the user
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          form.setError("root", {
            message: en.auth.signUp.autoLoginError,
          });
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      },
      onError: (error: any) => {
        const errMsg = error.message || en.auth.signUp.toastErrorFallback;
        form.setError("root", { message: errMsg });
        toast.error(errMsg);
      },
    });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center p-7">
        <CardTitle className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
          {en.auth.signUp.title}
        </CardTitle>
        <CardDescription className="text-neutral-500 mt-1.5 text-center">
          {en.auth.signUp.description}{" "}
          <Link href="/privacy">
            <span className="text-blue-600 dark:text-blue-400 hover:underline">{en.auth.signUp.privacyPolicyLink}</span>
          </Link>{" "}
          {en.common.and}{" "}
          <Link href="/terms">
            <span className="text-blue-600 dark:text-blue-400 hover:underline">{en.auth.signUp.termsLink}</span>
          </Link>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {form.formState.errors.root && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {form.formState.errors.root.message}
            </div>
          )}
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel>{en.auth.signUp.nameLabel}</FieldLabel>
                  <Input
                    type="text"
                    placeholder={en.auth.signUp.namePlaceholder}
                    className="w-full"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel>{en.auth.signUp.emailLabel}</FieldLabel>
                  <Input
                    type="email"
                    placeholder={en.auth.signUp.emailPlaceholder}
                    className="w-full"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel>{en.auth.signUp.passwordLabel}</FieldLabel>
                  <Input
                    type="password"
                    placeholder={en.auth.signUp.passwordPlaceholder}
                    className="w-full"
                    aria-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full cursor-pointer"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? en.auth.signUp.submitButtonLoading : en.auth.signUp.submitButton}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <SocialAuthButtons disabled={registerMutation.isPending} action="signup" />
      </CardContent>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7 flex justify-center text-center">
        <p className="text-sm text-muted-foreground">
          {en.auth.signUp.footer}{" "}
          <Link
            href={signInUrl}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {en.auth.signUp.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpCard;
