import Link from "next/link";
import { Lock, LogIn, Shield, UserPlus } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUserProfile } from "@/lib/auth";

type SiteHeaderProps = {
  profile: CurrentUserProfile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  return (
    <header className="siteHeader">
      <Link href="/" className="brand" aria-label="Lesson Designer 홈">
        Lesson Designer
      </Link>
      <nav className="headerActions" aria-label="계정 메뉴">
        {!profile ? (
          <>
            <Link href="/signup" className="headerButton">
              <UserPlus size={16} aria-hidden="true" />
              회원가입
            </Link>
            <Link href="/login" className="headerButton">
              <LogIn size={16} aria-hidden="true" />
              회원 로그인
            </Link>
            <Link href="/admin-login" className="headerButton">
              <Shield size={16} aria-hidden="true" />
              관리자 로그인
            </Link>
          </>
        ) : (
          <form action={logoutAction}>
            <button className="headerButton" type="submit">
              로그아웃
            </button>
          </form>
        )}
        <Link href="/admin" className="headerButton">
          <Lock size={16} aria-hidden="true" />
          관리자 페이지
        </Link>
      </nav>
    </header>
  );
}
