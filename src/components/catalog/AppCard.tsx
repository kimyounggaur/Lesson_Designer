import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Play } from "lucide-react";
import { ko } from "@/content/ko";
import {
  appLoginHref,
  appOpenHref,
  canOpenApp,
  getCategoryMeta,
  type CategoryTone,
  type LessonApp,
  type UserRole
} from "@/features/catalog";
import styles from "./AppCard.module.css";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
  /** 카드가 놓인 카테고리의 톤. 없으면 앱의 첫 카테고리 톤 */
  tone?: CategoryTone;
};

/** 앱 카드. 외부 URL 은 /go/[appId] 게이트로만 연결하고, 진행률 같은 가짜 지표는 두지 않는다 (C-1). */
export function AppCard({ app, role, tone }: AppCardProps) {
  const allowed = canOpenApp(app, role);
  const cardTone = tone ?? getCategoryMeta(app.categories[0]).tone;

  return (
    <article className={styles.card} data-tone={cardTone} data-locked={!allowed || undefined}>
      <div className={styles.top}>
        <span className={styles.iconWrap}>
          <Image src={app.icon} alt="" width={56} height={56} sizes="56px" className={styles.icon} />
        </span>
        <span className={styles.status} data-state={allowed ? "open" : "locked"}>
          {allowed ? <Play size={12} aria-hidden="true" /> : <LockKeyhole size={12} aria-hidden="true" />}
          {allowed ? ko.catalog.open : ko.catalog.locked}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{app.name}</h3>
        <p className={styles.desc}>{app.description}</p>
      </div>

      {allowed ? (
        // prefetch=false: /go 는 302 로 외부 앱에 보내는 라우트 핸들러라 프리페치하면 외부 앱까지 미리 요청하게 된다.
        <Link
          href={appOpenHref(app)}
          prefetch={false}
          target="_blank"
          rel="noreferrer"
          className={styles.action}
        >
          {ko.catalog.start}
          <Play size={14} aria-hidden="true" />
          <span className={styles.srOnly}>{ko.catalog.opensInNewTab}</span>
        </Link>
      ) : (
        <Link href={appLoginHref(app)} className={styles.action} data-variant="locked">
          {ko.catalog.loginToOpen}
          <LockKeyhole size={14} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
