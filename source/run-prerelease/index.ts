import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { reportErrors, reportNotice } from "@sharadox/git-hub-action-library/action-output";
import type { Environment, Write } from "@sharadox/git-hub-action-library/action-output/type";
import { distTagOf, prereleaseOf } from "@sharadox/git-hub-action-library/prerelease";

/** How the prerelease steps touch files: package.json and the step's outputs (replaced in tests). */
export interface PrereleaseFiles {
  readPackage: () => string;
  writePackage: (text: string) => void;
  output: (line: string) => void;
}

const DEFAULT_FILES = (environment: Environment): PrereleaseFiles => ({
  readPackage: () => readFileSync("package.json", "utf8"),
  writePackage: (text) => writeFileSync("package.json", text),
  output: (line) => appendFileSync(environment.GITHUB_OUTPUT ?? "/dev/null", `${line}\n`),
});

/**
 * The prerelease action's first step: on a push to `development` or `<feature>.development` (`BRANCH`, run
 * `RUN`), writes the prerelease version into package.json and outputs `version`, `tag` and `name` for publishing;
 * on any other branch outputs nothing to publish. Returns the exit code.
 */
export function runPrerelease(environment: Environment, write: Write, files = DEFAULT_FILES(environment)): number {
  const manifest = JSON.parse(files.readPackage()) as { name: string; version: string; private?: boolean };
  if (manifest.private === true)
    return reportErrors(["package.json says private: true, so it can't be published."], write);
  let prerelease;
  try {
    prerelease = prereleaseOf({
      branch: environment.BRANCH ?? "",
      version: manifest.version,
      run: environment.RUN ?? "0",
    });
  } catch (error) {
    return reportErrors([(error as Error).message], write);
  }
  if (!prerelease) {
    write(`${environment.BRANCH} publishes no prereleases.`);
    return 0;
  }
  files.writePackage(`${JSON.stringify({ ...manifest, version: prerelease.version }, null, 2)}\n`);
  files.output(`version=${prerelease.version}`);
  files.output(`tag=${prerelease.tag}`);
  files.output(`name=${manifest.name}`);
  reportNotice(`Publishing ${manifest.name}@${prerelease.version} under the "${prerelease.tag}" tag.`, write);
  return 0;
}

/**
 * The prerelease cleanup's step, when a branch is deleted: outputs the dist-tag its prereleases went under (`tag`) and
 * the package's `name`, so the tag can be removed; nothing for branches without prereleases. Returns the exit code.
 */
export function runDistTag(environment: Environment, write: Write, files = DEFAULT_FILES(environment)): number {
  let tag;
  try {
    tag = distTagOf(environment.BRANCH ?? "");
  } catch {
    tag = null;
  }
  if (!tag || tag === "development") {
    write(`${environment.BRANCH} keeps its tags.`);
    return 0;
  }
  files.output(`tag=${tag}`);
  files.output(`name=${(JSON.parse(files.readPackage()) as { name: string }).name}`);
  return 0;
}
