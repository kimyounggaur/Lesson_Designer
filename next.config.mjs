/** @type {import('next').NextConfig} */

// A-5: 기본 보안 응답 헤더.
// CSP 는 Phase 1 에서 Report-Only 로 시작했고, Phase 6 에서 4개 화면(홈·악기·게임·로그인)의 브라우저 콘솔 위반이
// 0건임을 Playwright(e2e/csp.spec.ts)로 확인한 뒤 enforce 로 전환했다. Next 인라인 스크립트 때문에
// script-src 'unsafe-inline' 은 유지한다 — nonce 전환은 별도 작업(DESIGN.md Step 6.6).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  }
];

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    // D1: 관리자 로그인 화면 삭제. 기존 북마크는 단일 로그인 화면으로 보낸다.
    return [{ source: "/admin-login", destination: "/login", permanent: true }];
  }
};

export default nextConfig;
