import type { ReactNode } from "react";
import { AppHeader } from "@/components/shell/AppHeader";
import { BottomNav } from "@/components/shell/BottomNav";
import type { CurrentUserProfile } from "@/features/auth/types";
import type { CategoryTone } from "@/features/catalog";
import styles from "./AppShell.module.css";

type AppShellProps = {
  profile: CurrentUserProfile | null;
  /** 셸 루트의 data-tone. 레이아웃 전체 톤 전환은 Phase 5 에서 정리한다 — 지금은 카테고리 페이지가 자기 섹션 루트에 단다. */
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
