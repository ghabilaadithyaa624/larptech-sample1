/**
 * Test-only seam for the logger.
 *
 * `sanitise` is the redaction function and is deliberately not exported from `logger.ts`: it
 * is an internal detail, and exporting it would invite production call sites to depend on it.
 * It lives in a separate module so tests can reach it without widening the logger's public
 * surface. This module is excluded from the build (see tsconfig "exclude").
 */

/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loggerModule = require("./logger") as {
  sanitise: (value: unknown, key?: string, depth?: number) => unknown;
  clearSecretValues: () => void;
  registerSecretValue: (value: string | undefined) => void;
};

export function sanitiseForTest(value: unknown): unknown {
  return loggerModule.sanitise(value);
}

export function clearSecretValues(): void {
  loggerModule.clearSecretValues();
}

export function registerSecretValue(value: string | undefined): void {
  loggerModule.registerSecretValue(value);
}
