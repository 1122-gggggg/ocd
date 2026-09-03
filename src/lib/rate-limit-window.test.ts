import { describe, it, expect } from "vitest";
import { estimateSlidingWindow } from "./rate-limit";

/**
 * The shared limiter approximates a sliding window from two fixed windows. The
 * property that matters is the one a naive fixed window gets wrong: you must
 * not be able to spend a full quota just before a boundary and another one just
 * after it.
 */
describe("estimateSlidingWindow", () => {
  const WINDOW = 60_000;

  it("counts only the current window once the previous one has rolled out", () => {
    expect(estimateSlidingWindow(0, 4, 0, WINDOW)).toBe(4);
    expect(estimateSlidingWindow(0, 4, WINDOW - 1, WINDOW)).toBe(4);
  });

  it("carries the whole previous window at the instant of the boundary", () => {
    expect(estimateSlidingWindow(10, 1, 0, WINDOW)).toBe(11);
  });

  it("decays the previous window linearly", () => {
    expect(estimateSlidingWindow(10, 0, WINDOW * 0.25, WINDOW)).toBe(8); // 7.5 -> 8
    expect(estimateSlidingWindow(10, 0, WINDOW * 0.5, WINDOW)).toBe(5);
    expect(estimateSlidingWindow(10, 0, WINDOW * 0.9, WINDOW)).toBe(1);
  });

  it("closes the double-quota hole at a window boundary", () => {
    const limit = 5;
    // Five hits land at the end of one window, five more just after it starts.
    const justAfterBoundary = estimateSlidingWindow(5, 5, 1, WINDOW);
    expect(justAfterBoundary).toBeGreaterThan(limit);
  });

  it("lets the same total through once a full window has passed", () => {
    const limit = 5;
    // A full window later the carry is gone, so a fresh five is allowed.
    expect(estimateSlidingWindow(0, 5, 1, WINDOW)).toBeLessThanOrEqual(limit);
  });

  it("never returns a fractional count", () => {
    for (let elapsed = 0; elapsed < WINDOW; elapsed += 997) {
      expect(Number.isInteger(estimateSlidingWindow(7, 3, elapsed, WINDOW))).toBe(true);
    }
  });
});
