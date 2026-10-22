import Link from "next/link";
import { LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { ko } from "@/content/ko";
import type { CurrentUserProfile } from "@/features/auth/types";
import { roleLabel } from "@/features/catalog";
import styles from "./AppHeader.module.css";

type AppHeaderProps = {
  profile: CurrentUserProfile | null;
};

/**
 * 셸 헤더: 브랜드(작게) + 역할별 인사 + 계정 칩.
 * 게스트 → /login, 회원 → 로그아웃 버튼, 관리자 → /admin + 로그아웃 (§5.4). 회원을 /admin 으로 보내지 않는다 (B-1).
 */
export function AppHeader({ profile }: AppHeaderProps) {
  const role = profile?.role ?? "guest";

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <Link href="/" className={styles.brand} aria-label={ko.shell.homeLink}>
          {ko.shell.eyebrow}
        </Link>

        <div className={styles.account}>
          {!profile ? (
            <Link href="/login" className={styles.chip} data-variant="solid">
              <LogIn size={16} aria-hidden="true" />
              {ko.shell.login}
            </Link>
          ) : null}

          {profile && role === "admin" ? (
            <Link href="/admin" className={styles.chip} data-variant="solid">
              <ShieldCheck size={16} aria-hidden="true" />
              {roleLabel(role)}
            </Link>
          ) : null}

          {profile && role !== "admin" ? (
            <span className={styles.chip} data-variant="static">
              <UserRound size={16} aria-hidden="true" />
              {roleLabel(role)}
            </span>
          ) : null}

          {profile ? (
            <form action={logoutAction} className={styles.form}>
              <button type="submit" className={styles.chip}>
                <LogOut size={16} aria-hidden="true" />
                {ko.shell.logout}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <p className={styles.greeting}>{ko.shell.greeting[role]}</p>
    </header>
  );
}
