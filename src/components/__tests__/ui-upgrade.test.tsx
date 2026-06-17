import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppCard } from "@/components/AppCard";
import { SiteHeader } from "@/components/SiteHeader";
import { LESSON_APPS } from "@/lib/apps";

describe("UI upgrade components", () => {
  it("shows locked apps as a guided next action instead of a dead end", () => {
    const lockedApp = LESSON_APPS.find((app) => !app.publicAccess);

    expect(lockedApp).toBeDefined();
    render(<AppCard app={lockedApp!} role="guest" />);

    expect(screen.getByText("로그인 필요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /로그인하고 열기/ })).toHaveAttribute("href", "/login?required=1");
    expect(screen.getByText("회원 계정으로 로그인하면 이용할 수 있어요.")).toBeInTheDocument();
  });

  it("keeps app cards descriptive enough for an app hub", () => {
    expect(LESSON_APPS.every((app) => app.description.length >= 12)).toBe(true);
    expect(LESSON_APPS.every((app) => app.categoryLabel.length > 0)).toBe(true);
  });

  it("separates primary navigation from admin account actions", () => {
    render(<SiteHeader profile={null} />);

    expect(screen.getByRole("navigation", { name: "주요 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "악기 교육앱" })).toHaveAttribute(
      "href",
      "/category/instrument-education"
    );
    expect(screen.getByRole("link", { name: "음악 게임앱" })).toHaveAttribute("href", "/category/music-game");
    expect(screen.getByRole("navigation", { name: "계정 메뉴" })).toHaveClass("accountNav");
  });
});
