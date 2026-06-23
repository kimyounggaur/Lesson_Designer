import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppCard } from "@/components/AppCard";
import { SiteHeader } from "@/components/SiteHeader";
import { LESSON_APPS } from "@/lib/apps";

describe("UI upgrade components", () => {
  it("renders app tiles with the HTML prototype start and locked states", () => {
    const openApp = LESSON_APPS.find((app) => app.publicAccess);
    const lockedApp = LESSON_APPS.find((app) => !app.publicAccess);

    expect(openApp).toBeDefined();
    expect(lockedApp).toBeDefined();

    const { rerender } = render(<AppCard app={openApp!} role="guest" />);
    expect(screen.getByRole("article")).toHaveClass("appTile");
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /시작/ })).toHaveAttribute("href", openApp!.url);

    rerender(<AppCard app={lockedApp!} role="guest" />);
    expect(screen.getAllByText("잠금").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /로그인/ })).toHaveAttribute("href", "/login?required=1");
  });

  it("keeps app cards descriptive enough for an app hub", () => {
    expect(LESSON_APPS.every((app) => app.description.length >= 12)).toBe(true);
    expect(LESSON_APPS.every((app) => app.categoryLabel.length > 0)).toBe(true);
  });

  it("uses the exported mobile app status header", () => {
    render(<SiteHeader profile={null} />);

    expect(screen.getByText("9:41")).toBeInTheDocument();
    expect(screen.getByText("LESSON DESIGNER")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /게스트/ })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("navigation", { name: "앱 빠른 이동" })).toHaveClass("appQuickNav");
  });
});
