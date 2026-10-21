"use server";

import { redirect } from "next/navigation";
import { toUserMessage } from "@/lib/auth-errors";
import type { AuthState } from "@/lib/auth-form-state";
import { getPublicEnv } from "@/lib/env";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";
import { getString, validateCredentials } from "@/lib/auth-validation";

const SIGNUP_NOTICE = "입력한 주소로 안내 메일을 보냈습니다. 메일함을 확인해주세요.";

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

  // 이미 가입된 이메일도 동일한 문구를 보여 계정 존재 여부를 노출하지 않는다.
  if (error && error.code !== "user_already_exists") {
    console.error("[auth:signup]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }

  return { message: SIGNUP_NOTICE, tone: "success" };
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
    console.error("[auth:login]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }

  redirect(safeNext(getString(formData, "next")));
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
  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("[auth:admin-login]", error.code, error.message);
    return { message: toUserMessage(error), tone: "error" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .maybeSingle();

  if (profileError) {
    console.error("[auth:admin-login] profiles 조회 실패", profileError.code, profileError.message);
  }

  // 비관리자 회원이어도 로그아웃시키지 않는다 (B-1 로그아웃 트랩 제거). 회원 화면으로 안내만 한다.
  if (profile?.role !== "admin") {
    return { message: "관리자 권한이 없는 계정입니다. 회원 화면에서 앱을 이용해주세요.", tone: "error" };
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
