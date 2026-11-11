import type { ReleaseTag } from "@sharadox/git-hub-action-library/release-tag/type";

/**
 * Checks a release tag before publishing: it must be on the production branch, equal `v` + package.json's version,
 * and the package must not be private. Returns every problem found.
 *
 * @example
 * checkReleaseTag({ tag: "v1.0.0", version: "1.0.0", isPrivate: false, onProduction: true }); // []
 */
export function checkReleaseTag({ tag, version, isPrivate, onProduction }: ReleaseTag): string[] {
  const problems: string[] = [];
  if (!onProduction) problems.push("Tags must point at a commit on the production branch.");
  if (tag !== `v${version}`) problems.push(`Tag ${tag} does not match package.json (v${version}).`);
  if (isPrivate) problems.push("package.json says private: true, so it can't be published.");
  return problems;
}
