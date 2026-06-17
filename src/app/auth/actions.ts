"use server";

import { redirect } from "next/navigation";
import type { AuthState } from "@/lib/auth-form-state";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getString, validateCredentials } from "@/lib/auth-validation";

function missingSupabaseState(): AuthState {
  return {
    message: "Supabase 환경 변수를 설정한 뒤 다시 시도해주세요.",
    tone: "error"
  };
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!getPublicEnv().isConfigured) {
    return missingSupabaseState();
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  return { message: "회원가입이 완료되었습니다. 로그인 후 이용해주세요.", tone: "success" };
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!getPublicEnv().isConfigured) {
    return missingSupabaseState();
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  redirect("/");
}

export async function adminLoginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  if (!getPublicEnv().isConfigured) {
    return missingSupabaseState();
  }

  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { message: "관리자 권한이 없는 계정입니다.", tone: "error" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (getPublicEnv().isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
