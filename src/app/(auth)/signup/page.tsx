import type { Metadata } from "next";
import { signUpAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth/AuthForm";
import { ko } from "@/content/ko";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: ko.auth.signup.title };

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;

  return <AuthForm variant="signup" action={signUpAction} next={safeNext(next)} />;
}
