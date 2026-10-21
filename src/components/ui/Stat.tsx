import type { LucideIcon } from "lucide-react";
import styles from "./Stat.module.css";

type StatProps = {
  icon: LucideIcon;
  value: number | string;
  label: string;
  /** glass: 그라데이션 배경 위에 올릴 때 */
  variant?: "paper" | "glass";
};

/** 숫자 1개 + 라벨. 값은 항상 실데이터(카탈로그 계산)여야 한다 (CLAUDE.md 규칙 4). */
export function Stat({ icon: Icon, value, label, variant = "paper" }: StatProps) {
  return (
    <div className={styles.stat} data-variant={variant}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={18} />
      </span>
      <strong className={styles.value}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
