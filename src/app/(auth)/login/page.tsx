import type { Metadata } from "next";
import { loginAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";
import { authNotice, ko } from "@/content/ko";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: ko.auth.login.title };

type LoginPageProps = {
  searchParams: Promise<{ required?: string; notice?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { required, notice, next } = await searchParams;

  return (
    <AuthForm
      variant="login"
      action={loginAction}
      next={safeNext(next)}
      notice={authNotice(notice) ?? (required ? ko.auth.notices.required : undefined)}
    />
  );
}
