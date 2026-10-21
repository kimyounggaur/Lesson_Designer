import { describe, expect, it } from "vitest";
import { safeNext } from "../safe-next";

describe("safeNext", () => {
  it("keeps same-site absolute paths", () => {
    expect(safeNext("/category/music-game")).toBe("/category/music-game");
    expect(safeNext("/go/kalimba?from=home")).toBe("/go/kalimba?from=home");
  });

  it("falls back to / for empty values", () => {
    expect(safeNext("")).toBe("/");
    expect(safeNext(null)).toBe("/");
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext("   ")).toBe("/");
  });

  it("blocks protocol-relative and absolute URLs", () => {
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
    expect(safeNext("/path?x=https://evil.com")).toBe("/");
  });

  it("blocks header injection characters", () => {
    expect(safeNext("/ok\r\nSet-Cookie: a=b")).toBe("/");
  });

  it("uses the provided fallback", () => {
    expect(safeNext("https://evil.com", "/admin")).toBe("/admin");
  });
});
