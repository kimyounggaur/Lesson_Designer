import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BottomNav } from "@/components/shell/BottomNav";

const nav = vi.hoisted(() => ({ pathname: "/category/music-game" as string | null }));

vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const TABS = { 홈: "/", 악기: "/category/instrument-education", 게임: "/category/music-game" } as const;

function currentTabs() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page")
    .map((link) => link.textContent);
}

describe("BottomNav", () => {
  beforeEach(() => {
    nav.pathname = "/category/music-game";
  });

  it("marks only the link matching the current path as aria-current=page", () => {
    render(<BottomNav role="guest" />);

    const menu = screen.getByRole("navigation", { name: "주 메뉴" });
    expect(menu).toBeInTheDocument();

    const game = screen.getByRole("link", { name: "게임" });
    expect(game).toHaveAttribute("aria-current", "page");
    expect(game).toHaveAttribute("href", "/category/music-game");

    for (const name of ["홈", "악기"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("aria-current");
    }
  });

  it("links every tab to its route", () => {
    render(<BottomNav role="guest" />);

    for (const [name, href] of Object.entries(TABS)) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("matches the home tab only on the exact root path", () => {
    nav.pathname = "/";
    const { unmount } = render(<BottomNav role="guest" />);
    expect(currentTabs()).toEqual(["홈"]);
    unmount();

    nav.pathname = "/login";
    render(<BottomNav role="guest" />);
    expect(currentTabs()).toEqual([]);
  });

  it("matches the instrument tab on the category route and the admin tab on /admin", () => {
    nav.pathname = "/category/instrument-education";
    const { unmount } = render(<BottomNav role="admin" />);
    expect(currentTabs()).toEqual(["악기"]);
    unmount();

    nav.pathname = "/admin";
    render(<BottomNav role="admin" />);
    expect(currentTabs()).toEqual(["관리"]);
  });

  it("falls back to the home tab when the pathname is unavailable", () => {
    nav.pathname = null;
    render(<BottomNav role="guest" />);
    expect(currentTabs()).toEqual(["홈"]);
  });

  it("shows the admin tab only to admins", () => {
    const { rerender } = render(<BottomNav role="guest" />);
    expect(screen.queryByRole("link", { name: "관리" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(3);

    rerender(<BottomNav role="member" />);
    expect(screen.queryByRole("link", { name: "관리" })).not.toBeInTheDocument();

    rerender(<BottomNav role="admin" />);
    expect(screen.getByRole("link", { name: "관리" })).toHaveAttribute("href", "/admin");
    expect(screen.getAllByRole("link")).toHaveLength(4);
  });
});
