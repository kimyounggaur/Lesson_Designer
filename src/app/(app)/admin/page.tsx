import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Globe, Layers, LockKeyhole, ShieldCheck } from "lucide-react";
import { AccessDenied } from "@/components/ui/AccessDenied";
import page from "@/components/ui/Page.module.css";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { ko } from "@/content/ko";
import { getCurrentUserProfile } from "@/features/auth/service";
import {
  APP_CATEGORIES,
  canAccessAdminPage,
  getCatalogStats,
  getCategoryMeta,
  getCategoryStats
} from "@/features/catalog";
import styles from "./admin.module.css";

export const metadata: Metadata = { title: ko.admin.eyebrow };

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  // 비관리자 회원은 리다이렉트·로그아웃 대신 403 안내만 보여준다 (B-1).
  if (!canAccessAdminPage(profile.role)) {
    return <AccessDenied />;
  }

  const stats = getCatalogStats();

  return (
    <div className={page.page}>
      <Link href="/" className={styles.back} data-variant="ghost">
        <ArrowLeft size={16} aria-hidden="true" />
        {ko.category.back}
      </Link>

      <section className={styles.heading} aria-labelledby="admin-title">
        <p className={styles.eyebrow}>
          <ShieldCheck size={16} aria-hidden="true" />
          {ko.admin.eyebrow}
        </p>
        <h1 id="admin-title" className={page.title}>
          {ko.admin.title}
        </h1>
        <p className={styles.desc}>{ko.admin.description(profile.email ?? "")}</p>
      </section>

      <div className={page.stats} role="group" aria-label={ko.home.statsLabel}>
        <Stat icon={Layers} value={stats.total} label={ko.stats.total} />
        <Stat icon={Globe} value={stats.publicCount} label={ko.stats.public} />
        <Stat icon={LockKeyhole} value={stats.lockedCount} label={ko.stats.locked} />
      </div>

      <section className={page.section} aria-labelledby="admin-category-title">
        <h2 id="admin-category-title" className={styles.sectionTitle}>
          {ko.admin.byCategory}
        </h2>
        <ul className={styles.list} role="list">
          {APP_CATEGORIES.map((category) => {
            const meta = getCategoryMeta(category);
            const categoryStats = getCategoryStats(category);

            return (
              <li key={category}>
                <Link href={`/category/${category}`} className={styles.row}>
                  <span>{meta.label}</span>
                  <span className={styles.rowMeta}>
                    {ko.catalog.categoryMeta(
                      categoryStats.total,
                      categoryStats.publicCount,
                      categoryStats.lockedCount
                    )}
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={page.section} aria-labelledby="admin-members-title">
        <h2 id="admin-members-title" className={styles.sectionTitle}>
          {ko.admin.membersTitle}
          <Pill variant="warn">{ko.admin.membersBadge}</Pill>
        </h2>
        <p className={styles.note}>{ko.admin.membersBody}</p>
      </section>
    </div>
  );
}
