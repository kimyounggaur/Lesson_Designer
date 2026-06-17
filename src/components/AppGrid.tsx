import { AppCard } from "@/components/AppCard";
import type { UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppGridProps = {
  apps: LessonApp[];
  role: UserRole;
};

export function AppGrid({ apps, role }: AppGridProps) {
  return (
    <div className="appGrid">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} role={role} />
      ))}
    </div>
  );
}
