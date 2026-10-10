/**
 * Retry backoff for the notification outbox.
 *
 * Exponential with jitter, capped.
 *
 * Jitter is not decoration. Every row that fails at the same moment — a provider outage
 * affecting a burst of leads — would otherwise become due at exactly the same millisecond,
 * so the worker would retry them all in a synchronised wave against a provider that is
 * already struggling. Spreading the retries is what stops the retry storm from becoming a
 * second outage.
 */

export type BackoffOptions = {
  /** Delay before the first retry. */
  baseMs: number;
  /** Upper bound on the delay, however many attempts have been made. */
  capMs: number;
  /**
   * Fraction of the computed delay that is randomised, 0..1.
   * 0 disables jitter (deterministic, useful in tests).
   */
  jitterRatio: number;
  /** Source of randomness, injected so tests are deterministic. */
  random?: () => number;
};

export const DEFAULT_BACKOFF: BackoffOptions = {
  baseMs: 5_000,
  capMs: 15 * 60_000,
  jitterRatio: 0.2,
};

export function computeRetryDelayMs(attempt: number, opts: BackoffOptions): number {
  // `attempt` is the number of attempts already made, so the first retry (attempt 1) waits
  // roughly baseMs, the second 2x, and so on.
  const exponent = Math.max(0, attempt - 1);
  const exponential = Math.min(opts.capMs, opts.baseMs * Math.pow(2, exponent));

  const ratio = Math.min(1, Math.max(0, opts.jitterRatio));
  if (ratio === 0) return Math.round(exponential);

  const random = opts.random ?? Math.random;
  // Subtract only: jitter shortens the delay rather than extending it, so the cap is a real
  // upper bound on how long a notification can be delayed.
  const jittered = exponential * (1 - ratio * random());
  return Math.max(1, Math.round(jittered));
}
