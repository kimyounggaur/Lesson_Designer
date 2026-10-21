import { describe, expect, it } from "vitest";
import { CREDENTIAL_ERRORS, credentialsFromForm, formString, PASSWORD_MIN } from "../validation";

function form(fields: Record<string, string>) {
  const data = new FormData();
  Object.entries(fields).forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("credentialsFromForm", () => {
  it("accepts a valid email and password", () => {
    const result = credentialsFromForm(form({ email: "user@example.com", password: "123456" }));
    expect(result).toEqual({ ok: true, value: { email: "user@example.com", password: "123456" } });
  });

  it("trims and lowercases the email", () => {
    const result = credentialsFromForm(form({ email: "  User@Example.COM ", password: "123456" }));
    expect(result.ok && result.value.email).toBe("user@example.com");
  });

  it("rejects emails without a domain or with spaces", () => {
    for (const email of ["lesson-designer", "user@", "@example.com", "user @example.com", "user@example"]) {
      const result = credentialsFromForm(form({ email, password: "123456" }));
      expect(result).toEqual({ ok: false, error: CREDENTIAL_ERRORS.email });
    }
  });

  it("rejects short passwords and does not trim them", () => {
    expect(credentialsFromForm(form({ email: "user@example.com", password: "12345" }))).toEqual({
      ok: false,
      error: CREDENTIAL_ERRORS.password
    });
    expect(credentialsFromForm(form({ email: "user@example.com", password: "     " }))).toEqual({
      ok: false,
      error: CREDENTIAL_ERRORS.password
    });
    expect(PASSWORD_MIN).toBe(6);
  });

  it("treats missing fields as empty strings", () => {
    expect(credentialsFromForm(new FormData())).toEqual({ ok: false, error: CREDENTIAL_ERRORS.email });
    expect(formString(new FormData(), "email")).toBe("");
  });

  it("ignores non-string form values", () => {
    const data = new FormData();
    data.set("email", new Blob(["x"]));
    data.set("password", "123456");
    expect(credentialsFromForm(data).ok).toBe(false);
  });
});
