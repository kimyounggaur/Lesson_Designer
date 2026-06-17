import Link from "next/link";
import { ArrowRight, Gamepad2, GraduationCap, Music2 } from "lucide-react";
import { CategoryButton } from "@/components/CategoryButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="homeShell">
        <section className="heroSection" aria-labelledby="home-title">
          <div className="heroCopy">
            <p className="eyebrow">
              <Music2 size={16} aria-hidden="true" />
              음악 수업 웹앱 포털
            </p>
            <h1 id="home-title">Lesson Designer</h1>
            <p className="heroLead">악기 교육앱과 음악 게임앱을 한 화면에서 찾고 바로 실행하는 수업용 허브입니다.</p>
            <div className="heroActions" aria-label="대표 앱 분류">
              <Link href="/category/instrument-education" className="heroAction edu">
                <GraduationCap size={18} aria-hidden="true" />
                악기 교육앱
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/category/music-game" className="heroAction play">
                <Gamepad2 size={18} aria-hidden="true" />
                음악 게임앱
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="heroStage" aria-hidden="true">
            <div className="heroStaff">
              <span className="staffLine" />
              <span className="staffLine" />
              <span className="staffLine" />
              <span className="staffLine" />
              <span className="staffLine" />
              <span className="playhead" />
              <span className="note noteA" />
              <span className="note noteB" />
              <span className="note noteC" />
            </div>
          </div>
        </section>

        <section className="categorySection" aria-labelledby="category-title">
          <div className="sectionHeading">
            <p className="eyebrow">대분류 카테고리</p>
            <h2 id="category-title">수업 방식에 맞춰 앱을 고르세요</h2>
          </div>
          <div className="categoryStack" aria-label="앱 대분류">
            <CategoryButton category="instrument-education" label="악기 교육앱" description="코드, 운지, 악기별 학습 앱" />
            <CategoryButton category="music-game" label="음악 게임앱" description="리듬과 연주 감각을 익히는 게임 앱" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
