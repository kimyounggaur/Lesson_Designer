import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth/AuthForm";
import { ko } from "@/content/ko";
import type { AuthState } from "@/features/auth/types";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

const noopAction = vi.fn<AuthAction>(async () => ({ message: "", tone: "idle" }));

function hiddenNext(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('input[type="hidden"][name="next"]');
}

describe("AuthForm", () => {
  it("renders the login variant with current-password autocomplete and a signup cross link that keeps next", () => {
    const { container } = render(<AuthForm variant="login" action={noopAction} next="/go/kalimba" />);

    expect(screen.getByRole("heading", { level: 1, name: ko.auth.login.title })).toBeInTheDocument();
    expect(screen.getByText(ko.auth.login.description)).toBeInTheDocument();
    expect(screen.getByLabelText(ko.auth.fields.email)).toHaveAttribute("autocomplete", "email");
    expect(screen.getByLabelText(ko.auth.fields.password)).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
    expect(screen.getByRole("button", { name: ko.auth.login.submit })).toBeEnabled();
    expect(hiddenNext(container)).toHaveValue("/go/kalimba");
    expect(screen.getByRole("link", { name: ko.auth.login.switchLabel })).toHaveAttribute(
      "href",
      "/signup?next=%2Fgo%2Fkalimba"
    );
  });

  it("renders the signup variant with new-password autocomplete and a plain login cross link for the home next", () => {
    const { container } = render(<AuthForm variant="signup" action={noopAction} />);

    expect(screen.getByRole("heading", { level: 1, name: ko.auth.signup.title })).toBeInTheDocument();
    expect(screen.getByLabelText(ko.auth.fields.password)).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByRole("button", { name: ko.auth.signup.submit })).toBeInTheDocument();
    expect(hiddenNext(container)).toHaveValue("/");
    expect(screen.getByRole("link", { name: ko.auth.signup.switchLabel })).toHaveAttribute("href", "/login");
  });

  it("announces a notice as a polite status, not an alert", () => {
    render(<AuthForm variant="login" action={noopAction} notice={ko.auth.notices.required} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(ko.auth.notices.required);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders no banner at all when there is nothing to say", () => {
    render(<AuthForm variant="login" action={noopAction} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("toggles password visibility with an accessible pressed state", () => {
    render(<AuthForm variant="login" action={noopAction} />);

    const password = screen.getByLabelText(ko.auth.fields.password);
    const toggle = screen.getByRole("button", { name: ko.auth.fields.showPassword });
    expect(password).toHaveAttribute("type", "password");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: ko.auth.fields.hidePassword })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("submits the credentials and the hidden next to the action and shows an error as role=alert", async () => {
    const action = vi.fn<AuthAction>(async () => ({
      message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      tone: "error"
    }));
    const { container } = render(<AuthForm variant="login" action={action} next="/go/kalimba" />);

    fireEvent.change(screen.getByLabelText(ko.auth.fields.email), {
      target: { value: "teacher@example.com" }
    });
    fireEvent.change(screen.getByLabelText(ko.auth.fields.password), { target: { value: "secret1" } });
    fireEvent.submit(container.querySelector("form")!);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("이메일 또는 비밀번호가 올바르지 않습니다.");
    expect(action).toHaveBeenCalledTimes(1);

    const [, formData] = action.mock.calls[0];
    expect(formData.get("email")).toBe("teacher@example.com");
    expect(formData.get("password")).toBe("secret1");
    expect(formData.get("next")).toBe("/go/kalimba");
  });

  it("shows a successful action result as a status message", async () => {
    const action = vi.fn<AuthAction>(async () => ({ message: ko.auth.signupSent, tone: "success" }));
    const { container } = render(<AuthForm variant="signup" action={action} />);

    fireEvent.submit(container.querySelector("form")!);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(ko.auth.signupSent);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
