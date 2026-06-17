export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
  isConfigured: boolean;
};

type EnvSource = Record<string, string | undefined>;

export function getPublicEnv(source: EnvSource = process.env): PublicEnv {
  const supabaseUrl = source.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const siteUrl = source.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey)
  };
}
