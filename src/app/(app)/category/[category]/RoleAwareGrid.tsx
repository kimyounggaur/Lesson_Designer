import Image from "next/image";
import Link from "next/link";
import { Layers, LockKeyhole, Play, ShieldCheck, UserRound } from "lucide-react";
import { AppGrid } from "@/components/catalog/AppGrid";
import { ko } from "@/content/ko";
import { getCurrentUserProfile } from "@/features/auth/service";
import {
  appOpenHref,
  firstOpenableApp,
  getAppsByCategory,
  getCategoryMeta,
  getCategoryStats,
  roleLabel,
  type AppCategory,
  type UserRole
} from "@/features/catalog";
import styles from "./category.module.css";

const ROLE_ICON = { guest: LockKeyhole, member: UserRound, admin: ShieldCheck } as const;

type RoleAwareGridProps = {
  category: AppCategory;
};

/** 역할에 따라 달라지는 부분(추천 카드·권한 스트립·잠금 표시)만 모아 Suspense 안에서 렌더한다. */
export async function RoleAwareGrid({ category }: RoleAwareGridProps) {
  const profile = await getCurrentUserProfile();
  const role: UserRole = profile?.role ?? "guest";
  const meta = getCategoryMeta(category);
  const apps = getAppsByCategory(category);
  const stats = getCategoryStats(category);
  // 추천 카드는 현재 역할로 열 수 있는 앱만 노출한다 (A-1). 열람 기록 기반 추천은 Phase 8.
  const featured = firstOpenableApp(apps, role);
  const RoleIcon = ROLE_ICON[role];

  return (
    <>
      {featured ? (
        <section className={styles.section} aria-labelledby="featured-title">
          <h2 id="featured-title" className={styles.sectionTitle}>
            {ko.category.continueTitle}
          </h2>
          <Link href={appOpenHref(featured)} target="_blank" rel="noreferrer" className={styles.featuredCard}>
            <span className={styles.featuredIcon}>
              <Image
                src={featured.icon}
                alt=""
                width={48}
                height={48}
                sizes="48px"
                className={styles.featuredImg}
              />
            </span>
            <span className={styles.featuredText}>
              <small className={styles.featuredKicker}>
                {meta.shortLabel} · {ko.category.continueHint}
              </small>
              <strong className={styles.featuredName}>{featured.name}</strong>
            </span>
            <span className={styles.featuredAction}>
              {ko.category.openNow}
              <Play size={14} aria-hidden="true" />
              <span className={styles.srOnly}>{ko.catalog.opensInNewTab}</span>
            </span>
          </Link>
        </section>
      ) : null}

      <div className={styles.strip} role="group" aria-label={ko.category.accessLabel}>
        <span className={styles.stripItem}>
          <Layers size={16} aria-hidden="true" />
          {ko.category.totalApps} <strong>{ko.category.count(stats.total)}</strong>
        </span>
        <span className={styles.stripItem}>
          <RoleIcon size={16} aria-hidden="true" />
          {ko.category.currentState} <strong>{roleLabel(role)}</strong>
        </span>
      </div>

      <section className={styles.section} aria-labelledby="all-apps-title">
        <div className={styles.listHead}>
          <h2 id="all-apps-title" className={styles.sectionTitle}>
            {ko.category.allApps}
          </h2>
          <span className={styles.listMeta}>
            {ko.category.count(stats.total)} · {ko.category.lockedSuffix} {stats.lockedCount}
          </span>
        </div>
        <AppGrid apps={apps} role={role} tone={meta.tone} />
      </section>
    </>
  );
}
