"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, GraduationCap, Home, Shield } from "lucide-react";
import { ko } from "@/content/ko";
import type { UserRole } from "@/features/catalog/access";
import styles from "./BottomNav.module.css";

const ITEMS = [
  { href: "/", label: ko.shell.nav.home, icon: Home, match: (p: string) => p === "/" },
  {
    href: "/category/instrument-education",
    label: ko.shell.nav.instrument,
    icon: GraduationCap,
    match: (p: string) => p.startsWith("/category/instrument-education")
  },
  {
    href: "/category/music-game",
    label: ko.shell.nav.game,
    icon: Gamepad2,
    match: (p: string) => p.startsWith("/category/music-game")
  },
  {
    href: "/admin",
    label: ko.shell.nav.admin,
    icon: Shield,
    match: (p: string) => p.startsWith("/admin"),
    adminOnly: true
  }
] as const;

/** 하단 탭. 홈 / 악기 / 게임 / (관리자만) 관리 — 현재 경로를 usePathname 으로 판정해 aria-current 를 단다 (C-2). */
export function BottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className={styles.nav} aria-label={ko.shell.menu}>
      {ITEMS.filter((item) => !("adminOnly" in item) || role === "admin").map(
        ({ href, label, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={href}
              href={href}
              className={styles.item}
              aria-current={active ? "page" : undefined}
              data-active={active || undefined}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        }
      )}
    </nav>
  );
}
