import { parseBranch } from "@sharadox/git-hub-action-library/branch";
import type { Prerelease } from "@sharadox/git-hub-action-library/prerelease/type";

/**
 * The npm dist-tag a branch's prereleases go under: `development` for the integration branch, the feature's name for
 * `<feature>.development`, none for anything else (production publishes real versions from its tags). Throws for a
 * feature name npm can't use as a tag: one that reads as a version (`v2`, `1-x`) or `latest`.
 *
 * @example
 * distTagOf("hero.development"); // "hero"
 */
export function distTagOf(branch: string): string | null {
  const parsed = parseBranch(branch);
  if (parsed.kind === "integration") return "development";
  if (parsed.kind !== "feature") return null;
  if (/^v?\d/.test(parsed.feature) || parsed.feature === "latest")
    throw new Error(
      `The feature name "${parsed.feature}" can't be an npm tag: start it with a letter, and not "latest".`,
    );
  return parsed.feature;
}

/**
 * The prerelease a push to a branch publishes: package.json's version, marked with the branch's tag and the run
 * number (`0.52.0` on `hero.development`, run 3: `0.52.0-hero.3`), or null for a branch without prereleases.
 *
 * @example
 * prereleaseOf({ branch: "development", version: "0.52.0", run: "7" }); // { version: "0.52.0-development.7", tag: "development" }
 */
export function prereleaseOf({
  branch,
  version,
  run,
}: {
  branch: string;
  version: string;
  run: string;
}): Prerelease | null {
  const tag = distTagOf(branch);
  return tag ? { version: `${version.replace(/-.*$/, "")}-${tag}.${run}`, tag } : null;
}
