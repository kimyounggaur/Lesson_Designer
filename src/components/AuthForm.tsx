"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();
  const isAdmin = title.includes("관리자");

  return (
    <main className="authShell">
      <section className={`authPanel ${isAdmin ? "adminAuth" : ""}`}>
        <div className="authIntro">
          <span className="authMark" aria-hidden="true">
            {isAdmin ? <LockKeyhole size={22} /> : <Mail size={22} />}
          </span>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <StatusBanner message={notice} tone="info" />

        <form action={formAction} className="authForm">
          <div className="fieldGroup">
            <label htmlFor={emailId}>이메일</label>
            <span className="fieldShell">
              <Mail size={18} aria-hidden="true" />
              <input id={emailId} name="email" type="email" autoComplete="email" required />
            </span>
          </div>

          <div className="fieldGroup">
            <label htmlFor={passwordId}>비밀번호</label>
            <span className="fieldShell passwordShell">
              <LockKeyhole size={18} aria-hidden="true" />
              <input
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                minLength={6}
                required
              />
              <button
                type="button"
                className="iconOnlyButton"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </span>
          </div>

          <button type="submit" disabled={pending}>
            {pending ? "처리 중" : submitLabel}
          </button>
        </form>

        <StatusBanner message={state.message} tone={state.tone} />

        <Link href="/" className="authBackLink">
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
