import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, Play, Sparkles, Trophy } from "lucide-react";
import { CategoryButton } from "@/components/CategoryButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";
import { CATEGORY_META, getCategoryStats, LESSON_APPS } from "@/lib/apps";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();
  const continueApp = LESSON_APPS.find((app) => app.publicAccess) ?? LESSON_APPS[0];
  const instrumentStats = getCategoryStats("instrument-education");
  const gameStats = getCategoryStats("music-game");

  return (
    <div className="deviceStage">
      <div className="phoneFrame">
        <SiteHeader profile={profile} />
        <main className="homeShell appMain">
          <section className="progressHero" aria-labelledby="progress-title">
            <div className="progressIcon" aria-hidden="true">
              <Flame size={24} />
            </div>
            <div>
              <h1 id="progress-title">0일 연속 학습 중!</h1>
              <p>오늘의 목표까지 40 XP 남았어요</p>
            </div>
            <strong>10/50</strong>
            <span className="progressTrack" aria-hidden="true">
              <span className="progressFill" />
            </span>
          </section>

          <section className="continueSection" aria-labelledby="continue-title">
            <h2 id="continue-title">이어서 학습하기</h2>
            <Link href={continueApp.url} className="continueCard" target="_blank" rel="noreferrer">
              <span className="continueIcon">
                <Image src={continueApp.icon} alt="" width={58} height={58} />
              </span>
              <span className="continueText">
                <strong>{continueApp.name}</strong>
                <span className="miniProgressTrack" aria-hidden="true">
                  <span />
                </span>
              </span>
              <em>60%</em>
              <span className="continuePlay" aria-hidden="true">
                <Play size={18} />
              </span>
            </Link>
          </section>

          <section className="categorySection appCategorySection" aria-labelledby="category-title">
            <div className="sectionHeading compactHeading">
              <p className="eyebrow">카테고리</p>
              <h2 id="category-title">수업 방식에 맞춰 앱을 고르세요</h2>
            </div>
            <div className="categoryStack">
              <CategoryButton
                category="instrument-education"
                label={CATEGORY_META["instrument-education"].label}
                description="코드, 운지, 음계를 단계별로 익히는 학습 앱"
              />
              <CategoryButton
                category="music-game"
                label={CATEGORY_META["music-game"].label}
                description="리듬과 연주 감각을 키우는 게임형 앱"
              />
            </div>
          </section>

          <section className="dashboardStats" aria-label="앱 현황">
            <div>
              <Flame size={18} aria-hidden="true" />
              <strong>{instrumentStats.total + gameStats.total}</strong>
              <span>전체 앱</span>
            </div>
            <div>
              <Trophy size={18} aria-hidden="true" />
              <strong>{instrumentStats.publicCount + gameStats.publicCount}</strong>
              <span>공개</span>
            </div>
            <div>
              <Heart size={18} aria-hidden="true" />
              <strong>{instrumentStats.lockedCount + gameStats.lockedCount}</strong>
              <span>회원용</span>
            </div>
            <div>
              <Sparkles size={18} aria-hidden="true" />
              <strong>LD</strong>
              <span>수업 허브</span>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
