"use server";

import { redirect } from "next/navigation";
import { ko } from "@/content/ko";
import { toUserMessage } from "@/features/auth/errors";
import type { AuthState } from "@/features/auth/types";
import { credentialsFromForm, formString, type Credentials } from "@/features/auth/validation";
import { getPublicEnv } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

type Parsed = { ok: true; value: Credentials; next: string } | { ok: false; state: AuthState };

function parse(formData: FormData): Parsed {
  if (!getPublicEnv().isConfigured) {
    return { ok: false, state: { message: ko.auth.notConfigured, tone: "error" } };
  }

  const result = credentialsFromForm(formData);

  if (!result.ok) {
    return { ok: false, state: { message: result.error, tone: "error" } };
  }

  return { ok: true, value: result.value, next: safeNext(formString(formData, "next")) };
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = parse(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const supabase = await createClient();
  const confirmUrl = new URL("/auth/confirm", getPublicEnv().siteUrl);
  confirmUrl.searchParams.set("next", parsed.next);

  const { error } = await supabase.auth.signUp({
    ...parsed.value,
    options: { emailRedirectTo: confirmUrl.toString() }
  });

  // 이미 가입된 이메일도 동일한 문구를 보여 계정 존재 여부를 노출하지 않는다.
  if (error && error.code !== "user_already_exists") {
    console.error("[auth:signup]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }

  return { message: ko.auth.signupSent, tone: "success" };
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = parse(formData);

  if (!parsed.ok) {
    return parsed.state;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.value);

  if (error) {
    console.error("[auth:login]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }

  redirect(parsed.next);
}

export async function logoutAction() {
  if (getPublicEnv().isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
