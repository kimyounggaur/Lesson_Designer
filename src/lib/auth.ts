import { normalizeRole, type UserRole } from "@/lib/access";
import { getPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type CurrentUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
};

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

  const { data } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: data?.email ?? user.email ?? null,
    role: normalizeRole(data?.role ?? "member")
  };
}

export async function getCurrentRole(): Promise<UserRole> {
  const profile = await getCurrentUserProfile();
  return profile?.role ?? "guest";
}
