import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Globe, Layers, LockKeyhole } from "lucide-react";
import { GridSkeleton } from "@/components/catalog/GridSkeleton";
import page from "@/components/ui/Page.module.css";
import { Stat } from "@/components/ui/Stat";
import { ko } from "@/content/ko";
import { getAppsByCategory, getCategoryMeta, getCategoryStats, isAppCategory } from "@/features/catalog";
import { RoleAwareGrid } from "./RoleAwareGrid";
import styles from "./category.module.css";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isAppCategory(category)) {
    return {};
  }

  const meta = getCategoryMeta(category);
  return { title: meta.label, description: meta.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isAppCategory(category)) {
    notFound();
  }

  const meta = getCategoryMeta(category);
  const stats = getCategoryStats(category);
  const skeletonCount = Math.min(getAppsByCategory(category).length, 4);

  // 카탈로그 히어로는 역할과 무관하므로 즉시 렌더하고, 역할 의존 부분은 Suspense 로 분리한다.
  return (
    <div className={page.page} data-tone={meta.tone}>
      <Link href="/" className={styles.back} data-variant="ghost">
        <ArrowLeft size={16} aria-hidden="true" />
        {ko.category.back}
      </Link>

      <section className={styles.hero} aria-labelledby="category-page-title">
        <h1 id="category-page-title" className={page.title}>
          {meta.label}
        </h1>
        <p className={styles.desc}>{meta.description}</p>
        <p className={styles.preview}>{meta.preview}</p>
        <div className={styles.stats} role="group" aria-label={ko.category.statsLabel}>
          <Stat icon={Layers} value={stats.total} label={ko.stats.total} variant="glass" />
          <Stat icon={Globe} value={stats.publicCount} label={ko.stats.public} variant="glass" />
          <Stat icon={LockKeyhole} value={stats.lockedCount} label={ko.stats.locked} variant="glass" />
        </div>
      </section>

      <Suspense fallback={<GridSkeleton count={skeletonCount} />}>
        <RoleAwareGrid category={category} />
      </Suspense>
    </div>
  );
}
