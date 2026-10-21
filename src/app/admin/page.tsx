import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { canAccessAdminPage } from "@/lib/access";
import { LESSON_APPS } from "@/lib/apps";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?next=/admin");
  }

  // 비관리자 회원은 리다이렉트 대신 403 안내만 보여준다. 로그아웃시키지 않는다 (B-1).
  if (!canAccessAdminPage(profile.role)) {
    return (
      <>
        <SiteHeader profile={profile} />
        <main className="pageShell adminPage">
          <section className="emptyState" aria-labelledby="access-denied-title">
            <strong id="access-denied-title">
              <LockKeyhole size={16} aria-hidden="true" /> 관리자 전용 화면입니다
            </strong>
            <p>회원 계정으로는 들어갈 수 없어요. 앱은 악기 교육·음악 게임 화면에서 바로 열 수 있습니다.</p>
            <Link href="/" className="backLink">
              <ArrowLeft size={17} aria-hidden="true" />
              홈으로
            </Link>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="pageShell adminPage">
        <Link href="/" className="backLink">
          <ArrowLeft size={17} aria-hidden="true" />
          홈으로
        </Link>
        <section className="pageHeading adminHeading">
          <p className="eyebrow">
            <ShieldCheck size={16} aria-hidden="true" />
            관리자 페이지
          </p>
          <h1>앱 접근 현황</h1>
          <p>{profile.email} 계정은 관리자 권한으로 모든 기능을 사용할 수 있습니다.</p>
        </section>
        <AppGrid apps={LESSON_APPS} role="admin" />
      </main>
      <SiteFooter />
    </>
  );
}
