import { describe, expect, it } from "vitest";
import { cleanChangelog } from "@/lib/changelog";

describe("CurseForge changelog", () => {
  it("preserves published HTML changes", () => {
    expect(cleanChangelog("<ul><li>Fixed dynamite explosion</li></ul>")).toBe("<ul><li>Fixed dynamite explosion</li></ul>");
  });
  it("treats missing and empty notes as no changelog", () => {
    expect(cleanChangelog(undefined)).toBeNull();
    expect(cleanChangelog("<p> </p>")).toBeNull();
  });
  it("removes executable code from external notes", () => {
    const result = cleanChangelog('<script>alert(1)</script><p onclick="alert(1)">Fix</p>');
    expect(result).toBe("<p>Fix</p>");
  });
});