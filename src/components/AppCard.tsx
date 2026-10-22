import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Play } from "lucide-react";
import { canOpenApp, getCategoryMeta, type LessonApp, type UserRole } from "@/features/catalog";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
};

/** 앱 열기 경로. 외부 URL 은 절대 직접 렌더하지 않는다 — 서버 게이트 /go/[appId] 경유. */
export function appOpenHref(app: Pick<LessonApp, "id">): Route {
  return `/go/${app.id}` as Route;
}

export function appLoginHref(app: Pick<LessonApp, "id">): Route {
  return `/login?required=1&next=${encodeURIComponent(appOpenHref(app))}` as Route;
}

export function AppCard({ app, role }: AppCardProps) {
  const allowed = canOpenApp(app, role);
  const meta = getCategoryMeta(app.categories[0]);
  const tone = meta.tone;
  // Phase 4에서 실데이터 없는 진행률 표시를 제거한다 (C-1).
  const progress = allowed ? 60 : 0;

  return (
    <article className={`appTile ${allowed ? "available" : "locked"} ${tone}`}>
      <div className="appTileTop">
        <div className="appTileIcon">
          <Image src={app.icon} alt={`${app.name} 아이콘`} width={74} height={74} className="appIcon" />
        </div>
        <span className={`tileStatus ${allowed ? "open" : "locked"}`}>{allowed ? "진행중" : "잠금"}</span>
      </div>

      <div className="appTileBody">
        <span className={`pill ${tone}`}>{meta.shortLabel}</span>
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
        <Link href={appOpenHref(app)} className="tileAction" target="_blank" rel="noreferrer">
          시작
          <Play size={15} aria-hidden="true" />
        </Link>
      ) : (
        <Link href={appLoginHref(app)} className="tileAction lockedAction">
          로그인
          <LockKeyhole size={15} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
