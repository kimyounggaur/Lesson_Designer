import Link from "next/link";
import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";
import { getAppsByCategory, getCategoryMeta, getCategoryStats, isAppCategory } from "@/lib/apps";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isAppCategory(category)) {
    notFound();
  }

  const profile = await getCurrentUserProfile();
  const role = profile?.role ?? "guest";
  const apps = getAppsByCategory(category);
  const meta = getCategoryMeta(category);
  const stats = getCategoryStats(category);

  return (
    <>
      <SiteHeader profile={profile} />
      <main className={`pageShell categoryPage ${meta.tone}`}>
        <Link href="/" className="backLink">
          <ArrowLeft size={17} aria-hidden="true" />
          홈으로
        </Link>

        <section className="pageHeading">
          <p className="eyebrow">앱 선택</p>
          <h1>{meta.label}</h1>
          <p>{meta.description}</p>
        </section>

        <section className="permissionStrip" aria-label="이용 권한 요약">
          <div>
            <span>전체 앱</span>
            <strong>{stats.total}개</strong>
          </div>
          <div>
            <span>미로그인 공개</span>
            <strong>{stats.publicCount}개</strong>
          </div>
          <div>
            <span>회원 로그인</span>
            <strong>{role === "guest" ? `${stats.lockedCount}개 잠김` : "전체 활성화"}</strong>
          </div>
          <div>
            <span>현재 상태</span>
            <strong className="roleState">
              {role === "guest" ? <LockKeyhole size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
              {role === "guest" ? "미로그인" : role === "admin" ? "관리자" : "회원"}
            </strong>
          </div>
        </section>

        <AppGrid apps={apps} role={role} />
      </main>
      <SiteFooter />
    </>
  );
}
