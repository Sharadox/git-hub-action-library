import { describe, expect, test } from "vitest";
import { checkReleaseTag } from "@sharadox/git-hub-action-library/release-tag";

describe("checkReleaseTag", () => {
  const release = { tag: "v1.2.3", version: "1.2.3", isPrivate: false, onProduction: true };

  test("accepts a tag on the production branch that matches package.json", () => {
    expect(checkReleaseTag(release)).toEqual([]);
  });

  test("reports every problem at once", () => {
    expect(checkReleaseTag({ tag: "v1.2.4", version: "1.2.3", isPrivate: true, onProduction: false })).toEqual([
      "Tags must point at a commit on the production branch.",
      "Tag v1.2.4 does not match package.json (v1.2.3).",
      "package.json says private: true, so it can't be published.",
    ]);
  });
});
