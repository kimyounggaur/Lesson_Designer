import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { ko } from "@/content/ko";
import styles from "./status.module.css";

export const metadata: Metadata = { title: ko.status.notFoundTitle };

/** 404 — 셸 밖이지만 셸과 같은 폭·폰트·토큰으로 그린다 (C-8). */
export default function NotFound() {
  return (
    <main className={styles.screen}>
      <span className={styles.icon} aria-hidden="true">
        <SearchX size={30} />
      </span>
      <h1 className={styles.title}>{ko.status.notFoundTitle}</h1>
      <p className={styles.body}>{ko.status.notFoundBody}</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.button}>
          <ArrowLeft size={16} aria-hidden="true" />
          {ko.status.home}
        </Link>
      </div>
    </main>
  );
}
