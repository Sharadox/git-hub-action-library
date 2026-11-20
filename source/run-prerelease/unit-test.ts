import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { runDistTag, runPrerelease } from "@sharadox/git-hub-action-library/run-prerelease";

const files = (manifest: object) => {
  const written: string[] = [];
  const outputs: string[] = [];
  return {
    written,
    outputs,
    readPackage: () => JSON.stringify(manifest),
    writePackage: (text: string) => written.push(text),
    output: (line: string) => outputs.push(line),
  };
};

test("versions a development or feature push as a prerelease and outputs how to publish it", () => {
  const write = vi.fn();
  const fake = files({ name: "@sharadox/web-library", version: "0.9.0" });
  expect(runPrerelease({ BRANCH: "hero.development", RUN: "4" }, write, fake)).toBe(0);
  expect(JSON.parse(fake.written[0]!).version).toBe("0.9.0-hero.4");
  expect(fake.outputs).toEqual(["version=0.9.0-hero.4", "tag=hero", "name=@sharadox/web-library"]);
  expect(write).toHaveBeenCalledWith('::notice::Publishing @sharadox/web-library@0.9.0-hero.4 under the "hero" tag.');
});

test("publishes nothing from other branches, private packages or features npm can't tag", () => {
  const write = vi.fn();
  const fake = files({ name: "x", version: "1.0.0" });
  expect(runPrerelease({ BRANCH: "index" }, write, fake)).toBe(0);
  expect(fake.outputs).toEqual([]);
  expect(runPrerelease({ BRANCH: "v2.development" }, write, fake)).toBe(1);
  expect(runPrerelease({ BRANCH: "development" }, write, files({ name: "x", version: "1.0.0", private: true }))).toBe(
    1,
  );
  expect(runPrerelease({}, write, fake)).toBe(0);
});

test("names a deleted feature's tag for removal, keeping development's and the others'", () => {
  const write = vi.fn();
  const fake = files({ name: "@sharadox/web-library", version: "1.0.0" });
  expect(runDistTag({ BRANCH: "hero.development" }, write, fake)).toBe(0);
  expect(fake.outputs).toEqual(["tag=hero", "name=@sharadox/web-library"]);
  for (const branch of ["development", "index", "v2.development", undefined]) {
    const other = files({ name: "x" });
    expect(runDistTag({ BRANCH: branch }, write, other)).toBe(0);
    expect(other.outputs).toEqual([]);
  }
});

test("reads and writes package.json and the step outputs in the working directory by default", () => {
  const directory = mkdtempSync(join(tmpdir(), "prerelease-"));
  const outputs = join(directory, "outputs");
  const previous = process.cwd();
  process.chdir(directory);
  try {
    writeFileSync("package.json", JSON.stringify({ name: "@sharadox/web-library", version: "0.9.0" }));
    expect(runPrerelease({ BRANCH: "development", RUN: "2", GITHUB_OUTPUT: outputs }, vi.fn())).toBe(0);
    expect(JSON.parse(readFileSync("package.json", "utf8")).version).toBe("0.9.0-development.2");
    expect(readFileSync(outputs, "utf8")).toContain("tag=development\n");
    expect(runDistTag({ BRANCH: "hero.development" }, vi.fn())).toBe(0);
  } finally {
    process.chdir(previous);
  }
});
