import { describe, expect, test, vi } from "vitest";
import { updateBranchDomain } from "@sharadox/git-hub-action-library/vercel-domain";

const base = {
  domain: "login.development.sharadox.com",
  branch: "login.development",
  project: "prj_1",
  team: "team_1",
  token: "secret",
};
const respond = (ok: boolean, body = "") => vi.fn().mockResolvedValue({ ok, text: () => Promise.resolve(body) });

describe("updateBranchDomain", () => {
  test("adds the domain for the branch when it is created", async () => {
    const fetch = respond(true);
    await updateBranchDomain({ ...base, event: "create", fetch });
    expect(fetch).toHaveBeenCalledWith("https://api.vercel.com/v10/projects/prj_1/domains?teamId=team_1", {
      method: "POST",
      headers: { Authorization: "Bearer secret", "Content-Type": "application/json" },
      body: JSON.stringify({ name: "login.development.sharadox.com", gitBranch: "login.development" }),
    });
  });

  test("removes the domain when the branch is deleted", async () => {
    const fetch = respond(true);
    await updateBranchDomain({ ...base, event: "delete", fetch });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.vercel.com/v9/projects/prj_1/domains/login.development.sharadox.com?teamId=team_1",
      { method: "DELETE", headers: { Authorization: "Bearer secret" } },
    );
  });

  test("fails with Vercel's answer when the request is refused", async () => {
    await expect(updateBranchDomain({ ...base, event: "create", fetch: respond(false, "forbidden") })).rejects.toThrow(
      "Vercel refused to add login.development.sharadox.com: forbidden",
    );
    await expect(updateBranchDomain({ ...base, event: "delete", fetch: respond(false, "missing") })).rejects.toThrow(
      "Vercel refused to remove login.development.sharadox.com: missing",
    );
  });

  test("uses the global fetch by default", async () => {
    const fetch = respond(true);
    vi.stubGlobal("fetch", fetch);
    await updateBranchDomain({ ...base, event: "delete" });
    expect(fetch).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
