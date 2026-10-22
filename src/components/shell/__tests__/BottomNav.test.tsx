import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav } from "@/components/shell/BottomNav";

vi.mock("next/navigation", () => ({ usePathname: () => "/category/music-game" }));

describe("BottomNav", () => {
  it("marks only the link matching the current path as aria-current=page", () => {
    render(<BottomNav role="guest" />);

    const nav = screen.getByRole("navigation", { name: "주 메뉴" });
    expect(nav).toBeInTheDocument();

    const game = screen.getByRole("link", { name: "게임" });
    expect(game).toHaveAttribute("aria-current", "page");
    expect(game).toHaveAttribute("href", "/category/music-game");

    for (const name of ["홈", "악기"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("aria-current");
    }
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
