import Link from "next/link";
import { BatteryFull, LogOut, Signal, UserRound, Wifi } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { roleLabel } from "@/features/catalog";
import type { CurrentUserProfile } from "@/features/auth/types";

type SiteHeaderProps = {
  profile: CurrentUserProfile | null;
};

/** 계정 칩 목적지. 회원을 /admin 으로 보내 로그아웃 트랩에 빠뜨리지 않는다 (B-1). */
function accountHref(profile: CurrentUserProfile | null) {
  if (!profile) {
    return "/login";
  }

  return profile.role === "admin" ? "/admin" : "/category/instrument-education";
}

export function SiteHeader({ profile }: SiteHeaderProps) {
  const label = roleLabel(profile?.role ?? "guest");

  return (
    <header className="siteHeader appHeader">
      <div className="appStatusBar" aria-label="기기 상태">
        <strong>9:41</strong>
        <span className="statusIcons" aria-hidden="true">
          <Signal size={15} />
          <Wifi size={15} />
          <BatteryFull size={17} />
        </span>
      </div>

      <div className="appHeaderTop">
        <Link href="/" className="brand appBrand" aria-label="Lesson Designer 홈">
          <span className="brandEyebrow">LESSON DESIGNER</span>
          <strong>반가워요, 선생님</strong>
          <small>앱들도 음악 게임들도 바로 열어요</small>
        </Link>

        <div className="accountCluster">
          <Link href={accountHref(profile)} className="userChip" aria-label={`${label} 계정`}>
            <UserRound size={18} aria-hidden="true" />
            <span>{label}</span>
          </Link>
          {profile ? (
            <form action={logoutAction}>
              <button className="iconLogoutButton" type="submit" aria-label="로그아웃">
                <LogOut size={16} aria-hidden="true" />
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <nav className="appQuickNav" aria-label="앱 빠른 이동">
        <Link href="/category/instrument-education">악기 교육</Link>
        <Link href="/category/music-game">음악 게임</Link>
      </nav>
    </header>
  );
}
