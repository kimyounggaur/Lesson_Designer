import Link from "next/link";
import { ArrowRight, Gamepad2, GraduationCap } from "lucide-react";
import { getCategoryMeta, getCategoryStats, type AppCategory } from "@/lib/apps";

type CategoryButtonProps = {
  category: AppCategory;
  label: string;
  description: string;
};

export function CategoryButton({ category, label, description }: CategoryButtonProps) {
  const meta = getCategoryMeta(category);
  const stats = getCategoryStats(category);
  const Icon = meta.tone === "edu" ? GraduationCap : Gamepad2;

  return (
    <Link href={`/category/${category}`} className={`categoryButton appCategoryCard ${meta.tone}`} data-category={category}>
      <span className="categoryIcon" aria-hidden="true">
        <Icon size={28} strokeWidth={1.9} />
      </span>
      <span className="categoryKicker">{meta.shortLabel}</span>
      <span className="categoryTitle">{label}</span>
      <span className="categoryDescription">{description}</span>
      <span className="categoryMetaLine">
        앱 {stats.total}개 · 공개 {stats.publicCount}개 · 회원용 {stats.lockedCount}개
      </span>
      <span className="categoryAction">
        열기
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}
