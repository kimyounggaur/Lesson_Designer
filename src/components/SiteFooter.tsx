import Link from "next/link";
import { Gamepad2, GraduationCap, Home, Shield } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="siteFooter bottomNav">
      <nav aria-label="하단 메뉴">
        <Link href="/">
          <Home size={18} aria-hidden="true" />
          <span>홈</span>
        </Link>
        <Link href="/category/instrument-education">
          <GraduationCap size={18} aria-hidden="true" />
          <span>악기</span>
        </Link>
        <Link href="/category/music-game">
          <Gamepad2 size={18} aria-hidden="true" />
          <span>게임</span>
        </Link>
        <Link href="/admin">
          <Shield size={18} aria-hidden="true" />
          <span>관리</span>
        </Link>
      </nav>
    </footer>
  );
}
