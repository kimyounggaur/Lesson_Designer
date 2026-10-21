import { normalizeRole, type UserRole } from "@/lib/access";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type CurrentUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
};

/**
 * 현재 로그인 사용자의 프로필을 돌려준다.
 * 프로필 조회가 실패하거나 행이 없으면 권한을 올리지 않고 guest 로 취급한다 (fail-closed).
 */
export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  if (!getPublicEnv().isConfigured) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[auth] profiles 조회 실패", { userId: user.id, code: error.code, message: error.message });
    return { id: user.id, email: user.email ?? null, role: "guest" };
  }

  if (!data) {
    console.warn("[auth] profiles 행 없음 — handle_new_user 트리거 확인 필요", { userId: user.id });
    return { id: user.id, email: user.email ?? null, role: "guest" };
  }

  return {
    id: user.id,
    email: data.email ?? user.email ?? null,
    role: normalizeRole(data.role)
  };
}
