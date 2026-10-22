import type { Page } from "@playwright/test";

/** 시각 스냅샷 · 접근성 · CSP 검사가 공유하는 4개 화면 (설계 §6 Step 6.4). */
export const SCREENS = [
  { name: "home", path: "/" },
  { name: "instrument-education", path: "/category/instrument-education" },
  { name: "music-game", path: "/category/music-game" },
  { name: "login", path: "/login" }
] as const;

export type Screen = (typeof SCREENS)[number];

/** 화면을 열고 네트워크·웹폰트·이미지가 모두 안정될 때까지 기다린다 (스냅샷 비결정성 제거). */
export async function openSettled(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            })
      )
    );
  });
}
