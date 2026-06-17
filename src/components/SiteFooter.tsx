import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <span>Lesson Designer</span>
      <nav aria-label="하단 메뉴">
        <Link href="/category/instrument-education">악기 교육앱</Link>
        <Link href="/category/music-game">음악 게임앱</Link>
        <Link href="/admin">관리자 페이지</Link>
      </nav>
    </footer>
  );
}
