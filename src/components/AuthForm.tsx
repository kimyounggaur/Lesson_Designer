"use client";

import { useActionState } from "react";
import { initialAuthState, type AuthState } from "@/lib/auth-form-state";
import { StatusBanner } from "@/components/StatusBanner";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: AuthAction;
  notice?: string;
};

export function AuthForm({ title, description, submitLabel, action, notice }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialAuthState);

  return (
    <main className="authShell">
      <section className="authPanel">
        <h1>{title}</h1>
        <p>{description}</p>
        <StatusBanner message={notice} tone="info" />
        <form action={formAction} className="authForm">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" autoComplete="current-password" minLength={6} required />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "처리 중" : submitLabel}
          </button>
        </form>
        <StatusBanner message={state.message} tone={state.tone} />
      </section>
    </main>
  );
}
