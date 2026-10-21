import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

// C-9: 토큰이 가리키는 Pretendard 를 실제로 로드한다. tokens.css 의 --font-sans 가 --font-pretendard 를 먼저 참조한다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard"
});

export const metadata: Metadata = {
  // D7: 실제 배포 도메인은 Vercel env NEXT_PUBLIC_SITE_URL 로 설정한다.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Lesson Designer", template: "%s · Lesson Designer" },
  description: "악기 교육앱과 음악 게임앱을 연결하는 수업 허브",
  applicationName: "Lesson Designer",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Lesson Designer" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3f5fd8"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
