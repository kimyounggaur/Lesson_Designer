import Link from "next/link";
import { ArrowRight, Gamepad2, GraduationCap } from "lucide-react";
import { ko } from "@/content/ko";
import { getCategoryMeta, getCategoryStats, type AppCategory } from "@/features/catalog";
import styles from "./CategoryCard.module.css";

type CategoryCardProps = {
  category: AppCategory;
};

/** 홈의 카테고리 카드. 보이는 텍스트(제목·설명·앱 수)가 곧 링크 이름이다 — aria-label 을 따로 두지 않는다. */
export function CategoryCard({ category }: CategoryCardProps) {
  const meta = getCategoryMeta(category);
  const stats = getCategoryStats(category);
  const Icon = meta.tone === "edu" ? GraduationCap : Gamepad2;

  return (
    <Link href={`/category/${category}`} className={styles.card} data-tone={meta.tone}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={28} strokeWidth={1.9} />
      </span>
      <h3 className={styles.title}>{meta.label}</h3>
      <span className={styles.desc}>{meta.description}</span>
      <span className={styles.meta}>
        {ko.catalog.categoryMeta(stats.total, stats.publicCount, stats.lockedCount)}
      </span>
      <span className={styles.action} aria-hidden="true">
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}
