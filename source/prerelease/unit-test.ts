import { expect, test } from "vitest";
import { distTagOf, prereleaseOf } from "@sharadox/git-hub-action-library/prerelease";

test("development and each feature publish under their own tag; production and others under none", () => {
  expect(distTagOf("development")).toBe("development");
  expect(distTagOf("contact-form.development")).toBe("contact-form");
  expect(distTagOf("index")).toBeNull();
  expect(distTagOf("dependabot/npm_and_yarn/x")).toBeNull();
});

test("refuses feature names npm would read as a version, or as latest", () => {
  for (const feature of ["v2", "1-x", "latest"])
    expect(() => distTagOf(`${feature}.development`)).toThrow(`The feature name "${feature}" can't be an npm tag`);
});

test("marks package.json's version with the tag and the run number", () => {
  expect(prereleaseOf({ branch: "hero.development", version: "0.52.0", run: "3" })).toEqual({
    version: "0.52.0-hero.3",
    tag: "hero",
  });
  expect(prereleaseOf({ branch: "development", version: "0.52.0-old.1", run: "8" })).toEqual({
    version: "0.52.0-development.8",
    tag: "development",
  });
  expect(prereleaseOf({ branch: "index", version: "0.52.0", run: "1" })).toBeNull();
});
