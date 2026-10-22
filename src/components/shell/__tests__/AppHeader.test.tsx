import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/shell/AppHeader";
import { ko } from "@/content/ko";
import type { CurrentUserProfile } from "@/features/auth/types";

vi.mock("@/app/auth/actions", () => ({ logoutAction: vi.fn() }));

function profile(role: CurrentUserProfile["role"]): CurrentUserProfile {
  return { id: "user-1", email: "teacher@example.com", role };
}

function adminLink() {
  return screen.queryAllByRole("link").find((link) => link.getAttribute("href") === "/admin");
}

describe("AppHeader", () => {
  it("offers guests a login chip and no account controls", () => {
    render(<AppHeader profile={null} />);

    expect(screen.getByRole("link", { name: ko.shell.homeLink })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: ko.shell.login })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: ko.shell.logout })).not.toBeInTheDocument();
    expect(adminLink()).toBeUndefined();
    expect(screen.getByText(ko.shell.greeting.guest)).toBeInTheDocument();
  });

  it("gives members a logout form but never a link to the admin page", () => {
    render(<AppHeader profile={profile("member")} />);

    const logout = screen.getByRole("button", { name: ko.shell.logout });
    expect(logout).toHaveAttribute("type", "submit");
    expect(logout.closest("form")).not.toBeNull();
    expect(screen.getByText("회원")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: ko.shell.login })).not.toBeInTheDocument();
    expect(adminLink()).toBeUndefined();
  });

  it("keeps a logged-in guest-role profile away from the admin page as well (fail-closed)", () => {
    render(<AppHeader profile={profile("guest")} />);

    expect(screen.getByRole("button", { name: ko.shell.logout })).toBeInTheDocument();
    expect(screen.getByText("게스트")).toBeInTheDocument();
    expect(adminLink()).toBeUndefined();
  });

  it("gives admins an admin chip plus logout", () => {
    render(<AppHeader profile={profile("admin")} />);

    expect(screen.getByRole("link", { name: "관리자" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("button", { name: ko.shell.logout })).toBeInTheDocument();
    expect(screen.getByText(ko.shell.greeting.admin)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: ko.shell.login })).not.toBeInTheDocument();
  });
});
