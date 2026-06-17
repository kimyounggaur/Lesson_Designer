import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Sparkles } from "lucide-react";
import { canOpenApp, type UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
};

export function AppCard({ app, role }: AppCardProps) {
  const allowed = canOpenApp(app, role);
  const tone = app.category === "instrument-education" ? "edu" : "play";

  return (
    <article className={`appCard ${allowed ? "available" : "locked"} ${tone}`}>
      <div className="appIconFrame">
        <Image src={app.icon} alt={`${app.name} 아이콘`} width={96} height={96} className="appIcon" />
      </div>

      <div className="appCardBody">
        <div className="cardMeta">
          <span className={`pill ${tone}`}>{app.categoryLabel}</span>
          <span className={`statusBadge ${allowed ? "open" : "locked"}`}>
            {allowed ? <Sparkles size={14} aria-hidden="true" /> : <LockKeyhole size={14} aria-hidden="true" />}
            {allowed ? "이용 가능" : "로그인 필요"}
          </span>
        </div>
        <h2>{app.name}</h2>
        <p>{app.description}</p>
      </div>

      {allowed ? (
        <Link href={app.url} className="appOpenButton" target="_blank" rel="noreferrer">
          앱 열기
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <div className="lockedActionGroup">
          <span>회원 계정으로 로그인하면 이용할 수 있어요.</span>
          <Link href="/login?required=1" className="appOpenButton lockedButton">
            로그인하고 열기
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </article>
  );
}
