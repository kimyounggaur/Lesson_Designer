import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Play } from "lucide-react";
import { canOpenApp, type UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
};

export function AppCard({ app, role }: AppCardProps) {
  const allowed = canOpenApp(app, role);
  const tone = app.category === "instrument-education" ? "edu" : "play";
  const progress = allowed ? 60 : 0;

  return (
    <article className={`appTile ${allowed ? "available" : "locked"} ${tone}`}>
      <div className="appTileTop">
        <div className="appTileIcon">
          <Image src={app.icon} alt={`${app.name} 아이콘`} width={74} height={74} className="appIcon" />
        </div>
        <span className={`tileStatus ${allowed ? "open" : "locked"}`}>
          {allowed ? "진행중" : "잠금"}
        </span>
      </div>

      <div className="appTileBody">
        <span className={`pill ${tone}`}>{app.categoryLabel}</span>
        <h2>{app.name}</h2>
        <p>{app.description}</p>
      </div>

      <div className="tileProgressRow" aria-label={`${app.name} 진행률`}>
        <span className="tileProgressTrack">
          <span className="tileProgressFill" style={{ width: `${progress}%` }} />
        </span>
        <strong>{allowed ? `${progress}%` : "잠금"}</strong>
      </div>

      {allowed ? (
        <Link href={app.url} className="tileAction" target="_blank" rel="noreferrer">
          시작
          <Play size={15} aria-hidden="true" />
        </Link>
      ) : (
        <Link href="/login?required=1" className="tileAction lockedAction">
          로그인
          <LockKeyhole size={15} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
