import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { ko } from "@/content/ko";
import styles from "./auth-layout.module.css";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.column}>
      <Link href="/" className={styles.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        {ko.auth.back}
      </Link>
      {children}
    </div>
  );
}
