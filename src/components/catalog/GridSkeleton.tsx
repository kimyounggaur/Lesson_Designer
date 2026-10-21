import { ko } from "@/content/ko";
import styles from "./GridSkeleton.module.css";

type GridSkeletonProps = {
  count?: number;
};

/** 역할 의존 그리드가 스트리밍되는 동안 보여주는 자리 표시자. 스크린리더에는 "불러오는 중" 한 번만 읽힌다. */
export function GridSkeleton({ count = 4 }: GridSkeletonProps) {
  return (
    <div className={styles.grid} role="status" aria-busy="true">
      <span className={styles.srOnly}>{ko.catalog.loading}</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.card} aria-hidden="true">
          <span className={`${styles.block} ${styles.icon}`} />
          <span className={`${styles.block} ${styles.text}`} />
          <span className={`${styles.block} ${styles.action}`} />
        </div>
      ))}
    </div>
  );
}
