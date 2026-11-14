// @vitest-environment node
import { describe, it, expect } from "vitest";
import { credentialStatus, hasAdminRole, validCredential } from "@/lib/api-security";
import { decryptCredential, encryptCredential } from "@/lib/api-crypto.server";

describe("Private API settings", () => {
  it("denies missing roles and ordinary users", () => {
    expect(hasAdminRole(null)).toBe(false);
    expect(hasAdminRole([{ role: "user" }])).toBe(false);
    expect(hasAdminRole([{ role: "admin" }])).toBe(true);
  });
  it("returns status only, never a saved credential", () => {
    expect(credentialStatus(true, null)).toEqual({ configured: true, updatedAt: null });
  });
  it("rejects header injection and empty credentials", () => {
    expect(validCredential("abc\r\nx-api-key: malicious")).toBe(false);
    expect(validCredential("")).toBe(false);
    expect(validCredential("test-only-credential")).toBe(true);
  });
  it("encrypts reversibly and rejects altered ciphertext", async () => {
    const encrypted = await encryptCredential("test-only-credential", "test-only-material");
    expect(encrypted).not.toContain("test-only-credential");
    expect(await decryptCredential(encrypted, "test-only-material")).toBe("test-only-credential");
    const modified = JSON.parse(encrypted);
    modified.data[0] ^= 1;
    await expect(decryptCredential(JSON.stringify(modified), "test-only-material")).rejects.toThrow();
  });
});