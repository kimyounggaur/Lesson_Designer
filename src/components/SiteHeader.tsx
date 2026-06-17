import Link from "next/link";
import { Gamepad2, GraduationCap, Home, Lock, LogIn, LogOut, Shield, UserPlus } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUserProfile } from "@/lib/auth";

type SiteHeaderProps = {
  profile: CurrentUserProfile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  return (
    <header className="siteHeader">
      <Link href="/" className="brand" aria-label="Lesson Designer 홈">
        <span className="brandMark" aria-hidden="true">LD</span>
        <span className="brandText">
          <strong>Lesson Designer</strong>
          <small>음악 수업 웹앱 포털</small>
        </span>
      </Link>

      <nav className="primaryNav" aria-label="주요 메뉴">
        <Link href="/" className="headerButton">
          <Home size={16} aria-hidden="true" />
          홈
        </Link>
        <Link href="/category/instrument-education" className="headerButton">
          <GraduationCap size={16} aria-hidden="true" />
          악기 교육앱
        </Link>
        <Link href="/category/music-game" className="headerButton">
          <Gamepad2 size={16} aria-hidden="true" />
          음악 게임앱
        </Link>
      </nav>

      <nav className="accountNav" aria-label="계정 메뉴">
        {!profile ? (
          <>
            <Link href="/signup" className="headerButton">
              <UserPlus size={16} aria-hidden="true" />
              회원가입
            </Link>
            <Link href="/login" className="headerButton emphasis">
              <LogIn size={16} aria-hidden="true" />
              회원 로그인
            </Link>
          </>
        ) : (
          <>
            <span className="profileBadge">{profile.role === "admin" ? "관리자" : "회원"} 로그인</span>
            <form action={logoutAction}>
              <button className="headerButton" type="submit">
                <LogOut size={16} aria-hidden="true" />
                로그아웃
              </button>
            </form>
          </>
        )}
      </nav>

      <nav className="adminNav" aria-label="관리자 메뉴">
        {profile?.role !== "admin" ? (
          <Link href="/admin-login" className="headerButton">
            <Lock size={16} aria-hidden="true" />
            관리자 로그인
          </Link>
        ) : null}
        <Link href="/admin" className="headerButton adminButton">
          <Shield size={16} aria-hidden="true" />
          관리자 페이지
        </Link>
      </nav>
    </header>
  );
}
