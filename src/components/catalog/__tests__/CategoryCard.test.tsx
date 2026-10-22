import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { ko } from "@/content/ko";
import { APP_CATEGORIES, getCategoryMeta, getCategoryStats } from "@/features/catalog";

describe("CategoryCard", () => {
  it.each(APP_CATEGORIES)("links %s to its category page and shows the real app counts", (category) => {
    const meta = getCategoryMeta(category);
    const stats = getCategoryStats(category);

    render(<CategoryCard category={category} />);

    const link = screen.getByRole("link", { name: new RegExp(meta.label) });
    expect(link).toHaveAttribute("href", `/category/${category}`);
    expect(link).toHaveAttribute("data-tone", meta.tone);
    expect(screen.getByRole("heading", { level: 3, name: meta.label })).toBeInTheDocument();
    expect(screen.getByText(meta.description)).toBeInTheDocument();
    expect(
      screen.getByText(ko.catalog.categoryMeta(stats.total, stats.publicCount, stats.lockedCount))
    ).toBeInTheDocument();
  });

  it("reports 12 instrument apps (2 public) and 4 game apps (0 public) from the catalog", () => {
    render(<CategoryCard category="instrument-education" />);
    expect(screen.getByText("앱 12개 · 공개 2개 · 회원용 10개")).toBeInTheDocument();

    render(<CategoryCard category="music-game" />);
    expect(screen.getByText("앱 4개 · 공개 0개 · 회원용 4개")).toBeInTheDocument();
  });
});
