import Link from "next/link";
import { BatteryFull, LogOut, Signal, UserRound, Wifi } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUserProfile } from "@/lib/auth";

type SiteHeaderProps = {
  profile: CurrentUserProfile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  const roleLabel = profile?.role === "admin" ? "관리자" : profile ? "회원" : "게스트";

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
          <Link href={profile ? "/admin" : "/login"} className="userChip" aria-label={`${roleLabel} 계정`}>
            <UserRound size={18} aria-hidden="true" />
            <span>{roleLabel}</span>
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
