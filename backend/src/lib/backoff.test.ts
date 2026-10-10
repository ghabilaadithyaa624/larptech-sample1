import "../test-env";

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeRetryDelayMs, DEFAULT_BACKOFF, type BackoffOptions } from "./backoff";

/** Jitter off, so the expected values below are exact. */
const noJitter = (over: Partial<BackoffOptions> = {}): BackoffOptions => ({
  ...DEFAULT_BACKOFF,
  jitterRatio: 0,
  ...over,
});

describe("computeRetryDelayMs", () => {
  it("waits roughly the base delay before the first retry", () => {
    assert.equal(computeRetryDelayMs(1, noJitter({ baseMs: 5_000 })), 5_000);
  });

  it("doubles with each attempt", () => {
    const opts = noJitter({ baseMs: 1_000, capMs: 10 ** 9 });
    const delays = [1, 2, 3, 4].map((a) => computeRetryDelayMs(a, opts));
    assert.deepEqual(delays, [1_000, 2_000, 4_000, 8_000]);
  });

  it("never exceeds the cap, however many attempts", () => {
    const opts = noJitter({ baseMs: 1_000, capMs: 30_000 });
    for (const attempt of [10, 20, 50]) {
      assert.equal(
        computeRetryDelayMs(attempt, opts),
        30_000,
        `attempt ${attempt} should be capped`,
      );
    }
  });

  it("treats attempt 0 like attempt 1 rather than producing a shorter delay", () => {
    const opts = noJitter({ baseMs: 2_000 });
    assert.equal(computeRetryDelayMs(0, opts), 2_000);
  });

  it("jitter shortens the delay but never raises it above the un-jittered value", () => {
    const opts: BackoffOptions = {
      baseMs: 10_000,
      capMs: 60_000,
      jitterRatio: 0.5,
      random: () => 0.999, // nearly maximum jitter
    };
    const delay = computeRetryDelayMs(1, opts);
    assert.ok(delay >= 5_000 && delay <= 10_000, `expected 5000..10000, got ${delay}`);
    assert.ok(delay < 10_000, "jitter should not leave the delay untouched");
  });

  it("is deterministic when randomness is injected", () => {
    const opts: BackoffOptions = {
      ...DEFAULT_BACKOFF,
      baseMs: 8_000,
      random: () => 0.5,
    };
    assert.equal(computeRetryDelayMs(1, opts), computeRetryDelayMs(1, opts));
  });

  it("spreads rows that fail together, so a provider outage is not hit by a synchronised wave", () => {
    // This is the whole reason jitter exists: without it every row that failed during an
    // outage becomes due at the identical millisecond.
    const opts: BackoffOptions = { baseMs: 5_000, capMs: 60_000, jitterRatio: 0.2 };
    const delays = new Set(Array.from({ length: 50 }, () => computeRetryDelayMs(1, opts)));
    assert.ok(delays.size > 10, `expected many distinct delays, got ${delays.size}`);
  });

  it("always returns a positive delay", () => {
    const opts: BackoffOptions = {
      baseMs: 1,
      capMs: 1,
      jitterRatio: 1,
      random: () => 1, // maximum downward jitter: would be 0 without the floor
    };
    assert.ok(computeRetryDelayMs(1, opts) >= 1);
  });
});
