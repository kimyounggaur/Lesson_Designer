import type { AuthTone } from "@/features/auth/types";
import styles from "./StatusBanner.module.css";

type StatusBannerProps = {
  message?: string;
  tone?: AuthTone;
};

/** 서버 액션 결과·안내 문구. 오류는 alert, 나머지는 status 로 읽어 주어 스크린리더가 놓치지 않게 한다 (F-4). */
export function StatusBanner({ message, tone = "idle" }: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={styles.banner}
      data-variant={tone}
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
