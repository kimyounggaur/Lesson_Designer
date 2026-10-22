import Image from "next/image";
import Link from "next/link";
import { Globe, Layers, LockKeyhole, Music, Play } from "lucide-react";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import page from "@/components/ui/Page.module.css";
import { Stat } from "@/components/ui/Stat";
import { ko } from "@/content/ko";
import { getCurrentUserProfile } from "@/features/auth/service";
import { appOpenHref, canOpenApp, getCatalogStats, getCategoryMeta, LESSON_APPS } from "@/features/catalog";
import styles from "./home.module.css";

const QUICK_START_LIMIT = 4;

export default async function HomePage() {
  const profile = await getCurrentUserProfile();
  const role = profile?.role ?? "guest";
  const stats = getCatalogStats();
  // 현재 역할로 열 수 있는 앱만 노출한다 (게스트: 공개 앱 / 회원: 상위 4개). 열람 기록 기반 추천은 Phase 8.
  const quickApps = LESSON_APPS.filter((app) => canOpenApp(app, role)).slice(0, QUICK_START_LIMIT);
  const lead = role === "guest" ? ko.home.lead.guest(stats.lockedCount) : ko.home.lead[role];

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <h1 id="home-title" className={styles.heroTitle}>
          <Music size={16} aria-hidden="true" />
          {ko.brand}
        </h1>
        <p className={styles.heroTagline}>{ko.tagline}</p>
        <p className={styles.heroLead}>{lead}</p>
        <div className={styles.ctaRow}>
          {role === "guest" ? (
            <>
              <Link href="/login" className={styles.cta}>
                {ko.home.cta.login}
              </Link>
              <Link href="/signup" className={styles.cta} data-variant="secondary">
                {ko.home.cta.signup}
              </Link>
            </>
          ) : (
            <>
              <Link href="/category/instrument-education" className={styles.cta}>
                {ko.home.cta.instrument}
              </Link>
              <Link href="/category/music-game" className={styles.cta} data-variant="secondary">
                {ko.home.cta.game}
              </Link>
            </>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="category-title">
        <div className={styles.sectionHead}>
          <p className={page.eyebrow}>{ko.home.categoryEyebrow}</p>
          <h2 id="category-title" className={page.sectionTitle}>
            {ko.home.categoryTitle}
          </h2>
        </div>
        <div className={styles.categoryStack}>
          <CategoryCard category="instrument-education" />
          <CategoryCard category="music-game" />
        </div>
      </section>

      {quickApps.length > 0 ? (
        <section className={styles.section} aria-labelledby="quick-title">
          <div className={styles.sectionHead}>
            <h2 id="quick-title" className={page.sectionTitle}>
              {ko.home.quickStartTitle}
            </h2>
            <p className={styles.hint}>
              {role === "guest" ? ko.home.quickStartHint.guest : ko.home.quickStartHint.member}
            </p>
          </div>
          <ul className={styles.quickList} role="list">
            {quickApps.map((app) => (
              <li key={app.id} className={styles.quickItem}>
                <Link
                  href={appOpenHref(app)}
                  prefetch={false}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.quickLink}
                  data-tone={getCategoryMeta(app.categories[0]).tone}
                >
                  <span className={styles.quickIcon}>
                    <Image
                      src={app.icon}
                      alt=""
                      width={44}
                      height={44}
                      sizes="44px"
                      className={styles.quickImg}
                    />
                  </span>
                  <span className={styles.quickName}>{app.name}</span>
                  <span className={styles.quickAction}>
                    {ko.catalog.start}
                    <Play size={12} aria-hidden="true" />
                    <span className="sr-only">{ko.catalog.opensInNewTab}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={page.stats} aria-label={ko.home.statsLabel}>
        <Stat icon={Layers} value={stats.total} label={ko.stats.total} />
        <Stat icon={Globe} value={stats.publicCount} label={ko.stats.public} />
        <Stat icon={LockKeyhole} value={stats.lockedCount} label={ko.stats.locked} />
      </section>
    </div>
  );
}
