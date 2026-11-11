import { describe, expect, test, vi } from "vitest";
import { runBranchDomain } from "@sharadox/git-hub-action-library/run-branch-domain";

const environment = {
  EVENT: "create",
  BRANCH: "login.development",
  BASE_DOMAIN: "sharadox.com",
  VERCEL_PROJECT_ID: "prj_1",
  VERCEL_TEAM_ID: "team_1",
  VERCEL_TOKEN: "secret",
};

describe("runBranchDomain", () => {
  test("serves a new feature branch on its own domain", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
      json: () => Promise.resolve({}),
    });
    const write = vi.fn();
    expect(await runBranchDomain(environment, write, fetch)).toBe(0);
    expect(fetch.mock.calls[0]![1].body).toBe(
      JSON.stringify({ name: "login.development.sharadox.com", gitBranch: "login.development" }),
    );
    expect(write).toHaveBeenCalledWith(
      "::notice::login.development is served on https://login.development.sharadox.com (Vercel team only)",
    );
  });

  test("removes the domain of a deleted branch", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(""),
      json: () => Promise.resolve({}),
    });
    const write = vi.fn();
    expect(await runBranchDomain({ ...environment, EVENT: "delete" }, write, fetch)).toBe(0);
    expect(write).toHaveBeenCalledWith("::notice::removed https://login.development.sharadox.com");
  });

  test("does nothing without a base domain, or for branches that aren't features", async () => {
    const fetch = vi.fn();
    const write = vi.fn();
    expect(await runBranchDomain({ ...environment, BASE_DOMAIN: "" }, write, fetch)).toBe(0);
    expect(await runBranchDomain({ ...environment, BRANCH: "development" }, write, fetch)).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
    expect(write).toHaveBeenCalledWith("No base domain: this repository's branches stay on Vercel's own addresses.");
    expect(write).toHaveBeenCalledWith("development is not a feature branch: nothing to do.");
  });

  test("treats missing variables as empty", async () => {
    const write = vi.fn();
    expect(await runBranchDomain({}, write, vi.fn())).toBe(0);
    expect(await runBranchDomain({ BASE_DOMAIN: "sharadox.com" }, write, vi.fn())).toBe(0);
    expect(write).toHaveBeenLastCalledWith(" is not a feature branch: nothing to do.");
  });

  test("rejects feature branches that can't be a subdomain", async () => {
    const write = vi.fn();
    expect(await runBranchDomain({ ...environment, BRANCH: "Login.development" }, write, vi.fn())).toBe(1);
    expect(write.mock.calls[0]![0]).toContain("can't be a subdomain");
  });

  test("reports Vercel failures as errors", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: () => Promise.resolve("forbidden"),
      json: () => Promise.resolve({}),
    });
    const write = vi.fn();
    expect(await runBranchDomain(environment, write, fetch)).toBe(1);
    expect(write).toHaveBeenCalledWith("::error::Vercel refused to add login.development.sharadox.com: forbidden");
  });

  test("requires the Vercel project, team and token", async () => {
    const write = vi.fn();
    expect(await runBranchDomain({ ...environment, VERCEL_TOKEN: "" }, write, vi.fn())).toBe(1);
    expect(write).toHaveBeenCalledWith(
      "::error::vercel-project-id, vercel-team-id and vercel-token are required with a base domain.",
    );
  });
});
