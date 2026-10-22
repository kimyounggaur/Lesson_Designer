import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppCard } from "@/components/catalog/AppCard";
import { getApp } from "@/features/catalog";

const publicApp = getApp("guitar-chord")!;
const memberApp = getApp("kalimba")!;

describe("AppCard", () => {
  it("links a public app to the /go gate for guests", () => {
    const { container } = render(<AppCard app={publicApp} role="guest" />);

    expect(screen.getByRole("heading", { level: 3, name: publicApp.name })).toBeInTheDocument();
    expect(screen.getByText("열림")).toBeInTheDocument();

    const start = screen.getByRole("link", { name: /시작/ });
    expect(start).toHaveAttribute("href", "/go/guitar-chord");
    expect(start).toHaveAttribute("target", "_blank");
    expect(start).toHaveTextContent("(새 창에서 열림)");
    expect(container.innerHTML).not.toContain("vercel.app");
  });

  it("sends guests to login with a next param for member-only apps", () => {
    const { container } = render(<AppCard app={memberApp} role="guest" />);

    expect(screen.getByRole("article")).toHaveAttribute("data-locked", "true");
    expect(screen.getByText("회원용")).toBeInTheDocument();

    const login = screen.getByRole("link", { name: /로그인하고 열기/ });
    expect(login.getAttribute("href")).toMatch(/^\/login\?next=%2Fgo%2F/);
    expect(container.innerHTML).not.toContain("vercel.app");
  });

  it("opens member-only apps for members without any progress figures", () => {
    const { container } = render(<AppCard app={memberApp} role="member" />);

    expect(screen.getByRole("link", { name: /시작/ })).toHaveAttribute("href", "/go/kalimba");
    expect(screen.getByRole("article")).not.toHaveAttribute("data-locked");
    expect(container.textContent).not.toMatch(/\d+%/);
    expect(container.innerHTML).not.toContain("vercel.app");
  });
});
