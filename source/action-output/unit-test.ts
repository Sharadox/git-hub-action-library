import { describe, expect, test, vi } from "vitest";
import { reportErrors, reportNotice } from "@sharadox/git-hub-action-library/action-output";

describe("reportErrors", () => {
  test("writes each error as a GitHub annotation and fails", () => {
    const write = vi.fn();
    expect(reportErrors(["first", "second"], write)).toBe(1);
    expect(write.mock.calls).toEqual([["::error::first"], ["::error::second"]]);
  });

  test("succeeds quietly without errors", () => {
    const write = vi.fn();
    expect(reportErrors([], write)).toBe(0);
    expect(write).not.toHaveBeenCalled();
  });
});

test("reportNotice writes a notice annotation", () => {
  const write = vi.fn();
  reportNotice("served", write);
  expect(write).toHaveBeenCalledWith("::notice::served");
});
