import Link from "next/link";
import { notFound } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";
import { getAppsByCategory, getCategoryLabel, isAppCategory } from "@/lib/apps";

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

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="pageShell">
        <Link href="/" className="backLink">
          홈으로
        </Link>
        <section className="pageHeading">
          <p className="eyebrow">앱 선택</p>
          <h1>{getCategoryLabel(category)}</h1>
          {role === "guest" ? (
            <p>미로그인 상태에서는 기타 코드 배우기와 우쿨렐레 코드 배우기만 바로 열 수 있습니다.</p>
          ) : (
            <p>로그인 권한으로 모든 앱을 열 수 있습니다.</p>
          )}
        </section>
        <AppGrid apps={apps} role={role} />
      </main>
    </>
  );
}
