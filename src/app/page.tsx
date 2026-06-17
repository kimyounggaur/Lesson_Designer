import { CategoryButton } from "@/components/CategoryButton";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="homeShell">
        <section className="homeIntro">
          <p className="eyebrow">음악 수업 웹앱 포털</p>
          <h1>Lesson Designer</h1>
        </section>
        <section className="categoryStack" aria-label="앱 대분류">
          <CategoryButton category="instrument-education" label="악기 교육앱" description="코드, 운지, 악기별 학습 앱" />
          <CategoryButton category="music-game" label="음악 게임앱" description="리듬과 연주 감각을 익히는 게임 앱" />
        </section>
      </main>
    </>
  );
}
