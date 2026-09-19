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
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SocialAuthButtons } from "./social-auth-buttons";

const SignInCard = () => {
  const loginMutation = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const rawCallbackUrl = searchParams.get("callbackUrl");
  const signUpUrl = rawCallbackUrl
    ? `/sign-up?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`
    : "/sign-up";

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast.success(en.auth.signIn.toastSuccess);
        router.push(callbackUrl);
        router.refresh();
      },
      onError: (error) => {
        form.setError("root", { message: error.message });
        toast.error(error.message || en.auth.signIn.toastErrorFallback);
      },
    });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center p-7">
        <CardTitle className="text-2xl font-bold text-foreground">
          {en.auth.signIn.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1.5">
          {en.auth.signIn.description}
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
              name="email"
              render={({ field, fieldState }) => (
                <Field invalid={!!fieldState.error}>
                  <FieldLabel>{en.auth.signIn.emailLabel}</FieldLabel>
                  <Input
                    type="email"
                    placeholder={en.auth.signIn.emailPlaceholder}
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
                  <FieldLabel>{en.auth.signIn.passwordLabel}</FieldLabel>
                  <Input
                    type="password"
                    placeholder={en.auth.signIn.passwordPlaceholder}
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending
                ? en.auth.signIn.submitButtonLoading
                : en.auth.signIn.submitButton}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <SocialAuthButtons disabled={loginMutation.isPending} action="login" />
      </CardContent>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7 flex justify-center text-center">
        <p className="text-sm text-muted-foreground">
          {en.auth.signIn.footer}{" "}
          <Link
            href={signUpUrl}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {en.auth.signIn.footerLink}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
