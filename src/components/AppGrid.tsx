import { AppCard } from "@/components/AppCard";
import type { UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppGridProps = {
  apps: LessonApp[];
  role: UserRole;
};

export function AppGrid({ apps, role }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <section className="emptyState" aria-label="앱 없음">
        <strong>표시할 앱이 없습니다.</strong>
        <p>관리자 페이지에서 앱 구성을 다시 확인해 주세요.</p>
      </section>
    );
  }

  return (
    <div className="appGrid">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} role={role} />
      ))}
    </div>
  );
}
