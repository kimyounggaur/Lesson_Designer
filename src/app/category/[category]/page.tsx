import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Flame, Heart, LockKeyhole, Play, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";
import { getAppsByCategory, getCategoryMeta, getCategoryStats, isAppCategory } from "@/lib/apps";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isAppCategory(category)) {
    notFound();
  }

  const profile = await getCurrentUserProfile();
  const role = profile?.role ?? "guest";
  const apps = getAppsByCategory(category);
  const meta = getCategoryMeta(category);
  const stats = getCategoryStats(category);
  const featuredApp = apps[0];

  return (
    <div className="deviceStage">
      <div className={`phoneFrame categoryPhone ${meta.tone}`}>
        <SiteHeader profile={profile} />
        <main className={`pageShell appMain categoryPage ${meta.tone}`}>
          <Link href="/" className="backLink">
            <ArrowLeft size={17} aria-hidden="true" />
            홈으로
          </Link>

          <section className="categoryHero" aria-labelledby="category-page-title">
            <p className="brandEyebrow">LESSON DESIGNER</p>
            <h1 id="category-page-title">{meta.label}</h1>
            <p>{meta.preview}</p>
            <div className="heroStatRow" aria-label="카테고리 현황">
              <span>
                <Flame size={16} aria-hidden="true" />
                <strong>{stats.total}</strong>
                전체
              </span>
              <span>
                <Sparkles size={16} aria-hidden="true" />
                <strong>{stats.publicCount}</strong>
                공개
              </span>
              <span>
                <Heart size={16} aria-hidden="true" />
                <strong>{stats.lockedCount}</strong>
                회원용
              </span>
            </div>
          </section>

          <nav className="mobileTabBar" aria-label="카테고리 전환">
            <Link className={category === "instrument-education" ? "active" : ""} href="/category/instrument-education">
              악기 교육
            </Link>
            <Link className={category === "music-game" ? "active" : ""} href="/category/music-game">
              음악 게임
            </Link>
          </nav>

          {featuredApp ? (
            <section className="continueSection featuredLesson" aria-labelledby="featured-title">
              <h2 id="featured-title">이어 학습하기</h2>
              <Link href={featuredApp.url} className="continueCard" target="_blank" rel="noreferrer">
                <span className="continueIcon">
                  <Image src={featuredApp.icon} alt="" width={58} height={58} />
                </span>
                <span className="continueText">
                  <small>{meta.shortLabel}</small>
                  <strong>{featuredApp.name}</strong>
                  <span className="miniProgressTrack" aria-hidden="true">
                    <span />
                  </span>
                </span>
                <em>60%</em>
                <span className="continuePlay" aria-hidden="true">
                  <Play size={18} />
                </span>
              </Link>
            </section>
          ) : null}

          <section className="permissionStrip appPermissionStrip" aria-label="이용 권한 요약">
            <div>
              <span>전체 앱</span>
              <strong>{stats.total}개</strong>
            </div>
            <div>
              <span>현재 상태</span>
              <strong className="roleState">
                {role === "guest" ? <LockKeyhole size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
                {role === "guest" ? "게스트" : role === "admin" ? "관리자" : "회원"}
              </strong>
            </div>
          </section>

          <section className="appListSection" aria-labelledby="all-apps-title">
            <div className="appListHeading">
              <h2 id="all-apps-title">전체 앱</h2>
              <span>
                {stats.total}개 · 잠김 {stats.lockedCount}
              </span>
            </div>
            <AppGrid apps={apps} role={role} />
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
