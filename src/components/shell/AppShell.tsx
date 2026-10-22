import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/AppHeader";
import { BottomNav } from "@/components/shell/BottomNav";
import type { CurrentUserProfile } from "@/features/auth/types";
import type { CategoryTone } from "@/features/catalog";
import styles from "./AppShell.module.css";

type AppShellProps = {
  profile: CurrentUserProfile | null;
  /**
   * 셸 루트의 data-tone. Phase 5 결정: 헤더는 모든 화면에서 브랜드 톤을 유지하고(앱의 고정 식별 영역),
   * 카테고리 톤은 페이지 루트·카드가 각자 data-tone 으로 입는다. (app) 레이아웃은 라우트 파라미터를 모르므로
   * 이 prop 은 전달하지 않는다 — 셸 전체 톤이 필요해지면 라우트 단위 톤 출처를 정한 뒤 여기로 넘긴다.
   */
  tone?: CategoryTone;
  children: ReactNode;
};

export function AppShell({ profile, tone, children }: AppShellProps) {
  return (
    <div className={styles.shell} data-tone={tone}>
      <AppHeader profile={profile} />
      <main id="main" className={styles.main}>
        {children}
      </main>
      <BottomNav role={profile?.role ?? "guest"} />
    </div>
  );
}
