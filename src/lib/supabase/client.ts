"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

export function createClient() {
  const env = getPublicEnv();

  if (!env.isConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
