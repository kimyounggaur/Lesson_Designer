import { GridSkeleton } from "@/components/catalog/GridSkeleton";
import page from "@/components/ui/Page.module.css";
import { ko } from "@/content/ko";
import styles from "./loading.module.css";

/** (app) 세그먼트 공통 로딩 — 셸(헤더·하단 탭)은 그대로 두고 본문만 스켈레톤으로 바꾼다 (C-8). */
export default function Loading() {
  return (
    <div className={page.page} role="status" aria-busy="true">
      <span className="sr-only">{ko.status.loading}</span>
      <div className={styles.hero} aria-hidden="true" />
      <div className={styles.card} aria-hidden="true" />
      <GridSkeleton count={2} announce={false} />
    </div>
  );
}
