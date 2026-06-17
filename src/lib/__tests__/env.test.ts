import { describe, expect, it } from "vitest";
import { getPublicEnv } from "../env";

describe("environment helpers", () => {
  it("returns missing setup state when Supabase env is absent", () => {
    const env = getPublicEnv({});

    expect(env.isConfigured).toBe(false);
    expect(env.supabaseUrl).toBe("");
    expect(env.supabaseAnonKey).toBe("");
  });

  it("returns configured state when Supabase env exists", () => {
    const env = getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
    });

    expect(env.isConfigured).toBe(true);
    expect(env.supabaseUrl).toBe("https://example.supabase.co");
    expect(env.supabaseAnonKey).toBe("anon-key");
  });
});
