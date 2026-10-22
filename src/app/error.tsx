"use client";

import Link from "next/link";
import { ArrowLeft, CircleAlert, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import button from "@/components/ui/Button.module.css";
import { ko } from "@/content/ko";
import styles from "./status.module.css";

type ErrorScreenProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** 런타임 오류 화면. 원문(error.message)은 노출하지 않고 digest 만 보여준다 (C-8). */
export default function ErrorScreen({ error, reset }: ErrorScreenProps) {
  useEffect(() => {
    console.error("[app:error]", error.digest ?? error.name);
  }, [error]);

  return (
    <main className={styles.screen}>
      <span className={styles.icon} data-variant="danger" aria-hidden="true">
        <CircleAlert size={30} />
      </span>
      <h1 className={styles.title}>{ko.status.errorTitle}</h1>
      <p className={styles.body}>{ko.status.errorBody}</p>
      <div className={styles.actions}>
        <button type="button" className={button.button} onClick={() => reset()}>
          <RotateCcw size={16} aria-hidden="true" />
          {ko.status.retry}
        </button>
        <Link href="/" className={button.button} data-variant="secondary">
          <ArrowLeft size={16} aria-hidden="true" />
          {ko.status.home}
        </Link>
      </div>
      {error.digest ? (
        <p className={styles.digest}>
          {ko.status.errorCode}: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
