import { expect, test, vi } from "vitest";
import { deleteBranchDeployments } from "@sharadox/git-hub-action-library/vercel-deployment";

const base = { branch: "login.development", project: "prj_1", team: "team_1", token: "secret" };
const answer = (ok: boolean, body: unknown = {}, status = ok ? 200 : 403) => ({
  ok,
  status,
  text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  json: () => Promise.resolve(body),
});

test("deletes the branch's deployments on every page, never production or other branches", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      answer(true, {
        deployments: [
          { uid: "a", target: null, meta: { githubCommitRef: "login.development" } },
          { uid: "b", target: "production", meta: { githubCommitRef: "login.development" } },
          { uid: "c", meta: { githubCommitRef: "development" } },
          { uid: "d" },
        ],
        pagination: { next: 42 },
      }),
    )
    .mockResolvedValueOnce(
      answer(true, { deployments: [{ uid: "e", target: "preview", meta: { githubCommitRef: "login.development" } }] }),
    )
    .mockResolvedValueOnce(answer(true))
    .mockResolvedValueOnce(answer(false, "gone", 404));
  expect(await deleteBranchDeployments({ ...base, fetch })).toBe(2);
  expect(fetch.mock.calls.map(([url, init]) => `${init.method} ${url}`)).toEqual([
    "GET https://api.vercel.com/v6/deployments?projectId=prj_1&teamId=team_1&limit=100",
    "GET https://api.vercel.com/v6/deployments?projectId=prj_1&teamId=team_1&limit=100&until=42",
    "DELETE https://api.vercel.com/v13/deployments/a?teamId=team_1",
    "DELETE https://api.vercel.com/v13/deployments/e?teamId=team_1",
  ]);
});

test("fails with Vercel's answer when listing or deleting is refused", async () => {
  await expect(
    deleteBranchDeployments({ ...base, fetch: vi.fn().mockResolvedValue(answer(false, "forbidden")) }),
  ).rejects.toThrow("Vercel refused to list deployments: forbidden");
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      answer(true, { deployments: [{ uid: "a", meta: { githubCommitRef: "login.development" } }] }),
    )
    .mockResolvedValueOnce(answer(false, "locked", 403));
  await expect(deleteBranchDeployments({ ...base, fetch })).rejects.toThrow(
    "Vercel refused to delete deployment a: locked",
  );
});

test("uses the global fetch by default", async () => {
  const fetch = vi.fn().mockResolvedValue(answer(true, { deployments: [] }));
  vi.stubGlobal("fetch", fetch);
  expect(await deleteBranchDeployments(base)).toBe(0);
  vi.unstubAllGlobals();
});
