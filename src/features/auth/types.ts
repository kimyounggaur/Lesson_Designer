import type { UserRole } from "@/features/catalog";

export type CurrentUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
};

export type AuthTone = "idle" | "success" | "error" | "info";

export type AuthState = {
  message: string;
  tone: AuthTone;
};

export const initialAuthState: AuthState = {
  message: "",
  tone: "idle"
};

export type AuthVariant = "login" | "signup";
