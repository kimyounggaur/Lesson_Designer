import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ko } from "@/content/ko";
import styles from "./AccessDenied.module.css";
import button from "./Button.module.css";

/** 403 안내. 회원을 로그아웃시키거나 다른 곳으로 보내지 않고 설명만 한다 (B-1). */
export function AccessDenied() {
  return (
    <section className={styles.card} aria-labelledby="access-denied-title">
      <span className={styles.icon} aria-hidden="true">
        <LockKeyhole size={26} />
      </span>
      <h1 id="access-denied-title" className={styles.title}>
        {ko.admin.deniedTitle}
      </h1>
      <p className={styles.body}>{ko.admin.deniedBody}</p>
      <div className={styles.actions}>
        <Link href="/" className={button.button}>
          <ArrowLeft size={16} aria-hidden="true" />
          {ko.status.home}
        </Link>
        <Link href="/category/instrument-education" className={button.button} data-variant="secondary">
          {ko.home.cta.instrument}
        </Link>
      </div>
    </section>
  );
}
