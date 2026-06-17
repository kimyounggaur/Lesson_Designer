export type AuthState = {
  message: string;
  tone: "idle" | "success" | "error";
};

export const initialAuthState: AuthState = {
  message: "",
  tone: "idle"
};
