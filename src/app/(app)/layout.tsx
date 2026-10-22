import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { getCurrentUserProfile } from "@/features/auth/service";

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  // cache() 로 감싸여 있어 페이지의 호출과 한 요청 안에서 공유된다.
  const profile = await getCurrentUserProfile();

  return <AppShell profile={profile}>{children}</AppShell>;
}
