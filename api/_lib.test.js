import { describe, it, expect, beforeEach } from "vitest";
import { checkPassword } from "./_lib.js";

describe("checkPassword", () => {
  beforeEach(() => { process.env.GYM_PASSWORD = "secret"; });
  it("accepte le bon Bearer", () => {
    expect(checkPassword("Bearer secret")).toBe(true);
  });
  it("refuse un mauvais mot de passe", () => {
    expect(checkPassword("Bearer nope")).toBe(false);
  });
  it("refuse un en-tête absent ou mal formé", () => {
    expect(checkPassword(undefined)).toBe(false);
    expect(checkPassword("secret")).toBe(false);
  });
});
