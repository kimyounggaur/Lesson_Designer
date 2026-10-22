import { AppCard } from "@/components/catalog/AppCard";
import { ko } from "@/content/ko";
import type { CategoryTone, LessonApp, UserRole } from "@/features/catalog";
import styles from "./AppGrid.module.css";

type AppGridProps = {
  apps: readonly LessonApp[];
  role: UserRole;
  tone?: CategoryTone;
};

export function AppGrid({ apps, role, tone }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <p className={styles.empty} role="status">
        {ko.catalog.empty}
      </p>
    );
  }

  return (
    <ul className={styles.grid} role="list">
      {apps.map((app) => (
        <li key={app.id} className={styles.item}>
          <AppCard app={app} role={role} tone={tone} />
        </li>
      ))}
    </ul>
  );
}
