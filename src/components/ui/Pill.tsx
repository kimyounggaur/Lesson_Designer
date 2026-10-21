import type { ReactNode } from "react";
import styles from "./Pill.module.css";

type PillProps = {
  /** accent: 열림 같은 긍정 상태, warn: 회원용·준비 중 같은 주의 상태 */
  variant: "accent" | "warn";
  children: ReactNode;
};

/** 짧은 상태 배지. 아이콘과 텍스트를 함께 넣어 색만으로 뜻을 전하지 않는다 (F-2). */
export function Pill({ variant, children }: PillProps) {
  return (
    <span className={styles.pill} data-variant={variant}>
      {children}
    </span>
  );
}
