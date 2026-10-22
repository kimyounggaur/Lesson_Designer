import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBanner } from "@/components/auth/StatusBanner";

describe("StatusBanner", () => {
  it("renders nothing without a message", () => {
    const { container } = render(<StatusBanner message="" tone="error" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces errors as an alert", () => {
    render(<StatusBanner message="문제가 있어요" tone="error" />);
    const banner = screen.getByRole("alert");
    expect(banner).toHaveTextContent("문제가 있어요");
    expect(banner).toHaveAttribute("data-variant", "error");
  });

  it("announces every other tone as a polite status", () => {
    for (const tone of ["idle", "success", "info"] as const) {
      const { unmount } = render(<StatusBanner message={`${tone} 메시지`} tone={tone} />);
      expect(screen.getByRole("status")).toHaveTextContent(`${tone} 메시지`);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      unmount();
    }
  });
});
