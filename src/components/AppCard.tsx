import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LockKeyhole } from "lucide-react";
import { canOpenApp, type UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
};

export function AppCard({ app, role }: AppCardProps) {
  const allowed = canOpenApp(app, role);

  return (
    <article className={`appCard ${allowed ? "" : "locked"}`}>
      <div className="appIconFrame">
        <Image src={app.icon} alt="" width={96} height={96} className="appIcon" />
      </div>
      <h2>{app.name}</h2>
      {allowed ? (
        <Link href={app.url} className="appOpenButton" target="_blank" rel="noreferrer">
          <ExternalLink size={16} aria-hidden="true" />
          선택
        </Link>
      ) : (
        <Link href="/login?required=1" className="appOpenButton lockedButton">
          <LockKeyhole size={16} aria-hidden="true" />
          로그인 필요
        </Link>
      )}
    </article>
  );
}
