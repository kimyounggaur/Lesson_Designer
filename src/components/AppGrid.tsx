import { AppCard } from "@/components/AppCard";
import type { LessonApp, UserRole } from "@/features/catalog";

type AppGridProps = {
  apps: readonly LessonApp[];
  role: UserRole;
};

export function AppGrid({ apps, role }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <section className="emptyState" aria-label="앱 없음">
        <strong>표시할 앱이 없습니다.</strong>
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
