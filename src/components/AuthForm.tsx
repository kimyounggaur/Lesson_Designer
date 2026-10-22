"use client";

import type { Route } from "next";
import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserPlus } from "lucide-react";
import { StatusBanner } from "@/components/StatusBanner";
import { ko } from "@/content/ko";
import { initialAuthState, type AuthState, type AuthVariant } from "@/features/auth/types";
import { PASSWORD_MIN } from "@/features/auth/validation";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

type AuthFormProps = {
  variant: AuthVariant;
  action: AuthAction;
  /** 로그인 후 돌아갈 같은 사이트 경로. 서버에서 safeNext 로 다시 검증한다. */
  next?: string;
  notice?: string;
};

export function AuthForm({ variant, action, next = "/", notice }: AuthFormProps) {
  const copy = ko.auth[variant];
  const [state, formAction, pending] = useActionState(action, initialAuthState);
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const isSignup = variant === "signup";
  const switchHref = `${isSignup ? "/login" : "/signup"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}` as Route;

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="authIntro">
          <span className="authMark" aria-hidden="true">
            {isSignup ? <UserPlus size={22} /> : <Mail size={22} />}
          </span>
          <div>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
          </div>
        </div>

        <StatusBanner message={notice} tone="info" />

        <form action={formAction} className="authForm">
          <input type="hidden" name="next" value={next} />

          <div className="fieldGroup">
            <label htmlFor={emailId}>{ko.auth.fields.email}</label>
            <span className="fieldShell">
              <Mail size={18} aria-hidden="true" />
              <input id={emailId} name="email" type="email" autoComplete="email" inputMode="email" required />
            </span>
          </div>

          <div className="fieldGroup">
            <label htmlFor={passwordId}>{ko.auth.fields.password}</label>
            <span className="fieldShell passwordShell">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={PASSWORD_MIN}
                required
              />
              <button
                type="button"
                className="iconOnlyButton"
                aria-label={showPassword ? ko.auth.fields.hidePassword : ko.auth.fields.showPassword}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </span>
          </div>

          <button type="submit" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </button>
        </form>

        <StatusBanner message={state.message} tone={state.tone} />

        <p className="authSwitch">
          {copy.switchPrompt} <Link href={switchHref}>{copy.switchLabel}</Link>
        </p>
      </section>
    </main>
  );
}
