import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { canAccessAdminPage } from "@/lib/access";
import { LESSON_APPS } from "@/lib/apps";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();

  if (!canAccessAdminPage(profile?.role ?? "guest")) {
    redirect("/admin-login");
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
          <p>{profile?.email} 계정은 관리자 권한으로 모든 기능을 사용할 수 있습니다.</p>
        </section>
        <AppGrid apps={LESSON_APPS} role="admin" />
      </main>
      <SiteFooter />
    </>
  );
}
