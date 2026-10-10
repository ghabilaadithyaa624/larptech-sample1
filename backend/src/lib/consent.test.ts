import "../test-env";

import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

/**
 * Tests for the frontend consent module.
 *
 * Lives in the backend suite only because that is the test runner this repository has —
 * there is no frontend test runner yet. It imports across the package boundary the same way
 * `validatorParity.test.ts` does; test files are excluded from `tsconfig.json`, so no build
 * artefact depends on the path.
 *
 * What is worth testing here is the parsing and the failure modes, because the dangerous
 * direction is a malformed stored value being read as consent. Every ambiguous input must
 * resolve to "ask again", never to "granted".
 */
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  currentConsent,
  getStoredConsent,
  hasAnalyticsConsent,
  parseStoredConsent,
  storeConsent,
  subscribeToConsent,
  // @ts-expect-error -- resolved at test time by tsx; not part of the backend build graph.
} from "../../../frontend/src/lib/consent";

/**
 * Minimal `localStorage` stand-in. Installed on `globalThis.window` because the module
 * under test reaches for `window.localStorage`.
 */
function installStorage(initial: Record<string, string> = {}): { data: Map<string, string> } {
  const data = new Map(Object.entries(initial));
  const storage = {
    getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
  (globalThis as { window?: unknown }).window = { localStorage: storage };
  return { data };
}

function removeStorage(): void {
  delete (globalThis as { window?: unknown }).window;
}

afterEach(() => {
  removeStorage();
});

function validRecord(over: Record<string, unknown> = {}): string {
  return JSON.stringify({
    analytics: "granted",
    decidedAt: "2026-01-01T00:00:00.000Z",
    version: CONSENT_VERSION,
    ...over,
  });
}

describe("parseStoredConsent", () => {
  it("returns null when nothing is stored", () => {
    assert.equal(parseStoredConsent(null), null);
    assert.equal(parseStoredConsent(""), null);
  });

  it("returns null for malformed JSON rather than throwing", () => {
    assert.equal(parseStoredConsent("{not json"), null);
    assert.equal(parseStoredConsent("undefined"), null);
    assert.equal(parseStoredConsent("[]"), null);
    assert.equal(parseStoredConsent("null"), null);
    assert.equal(parseStoredConsent("42"), null);
  });

  it("parses a well-formed record", () => {
    const parsed = parseStoredConsent(validRecord());
    assert.deepEqual(parsed, {
      analytics: "granted",
      decidedAt: "2026-01-01T00:00:00.000Z",
      version: CONSENT_VERSION,
    });
  });

  it("rejects a record from a different consent version", () => {
    // If the policy changes, previously given consent is not assumed to still cover it.
    assert.equal(parseStoredConsent(validRecord({ version: CONSENT_VERSION + 1 })), null);
    assert.equal(parseStoredConsent(validRecord({ version: 0 })), null);
    assert.equal(parseStoredConsent(validRecord({ version: "1" })), null);
  });

  it("rejects an unknown analytics value — ambiguity must not become consent", () => {
    for (const bad of ["granted ", "GRANTED", "yes", "true", 1, null, undefined, {}]) {
      assert.equal(parseStoredConsent(validRecord({ analytics: bad })), null, `rejected ${JSON.stringify(bad)}`);
    }
  });

  it("accepts an explicit denial", () => {
    assert.equal(parseStoredConsent(validRecord({ analytics: "denied" }))?.analytics, "denied");
  });

  it("rejects a record with no decision timestamp", () => {
    assert.equal(parseStoredConsent(validRecord({ decidedAt: undefined })), null);
    assert.equal(parseStoredConsent(validRecord({ decidedAt: 12345 })), null);
  });
});

describe("consent state from storage", () => {
  it("is 'unknown' when nothing has been decided", () => {
    installStorage();
    assert.equal(currentConsent(), "unknown");
    assert.equal(hasAnalyticsConsent(), false);
    assert.equal(getStoredConsent(), null);
  });

  it("is false rather than unknown when analytics was declined", () => {
    installStorage({ [CONSENT_STORAGE_KEY]: validRecord({ analytics: "denied" }) });
    assert.equal(currentConsent(), "denied");
    assert.equal(hasAnalyticsConsent(), false);
  });

  it("is granted only when explicitly granted", () => {
    installStorage({ [CONSENT_STORAGE_KEY]: validRecord({ analytics: "granted" }) });
    assert.equal(currentConsent(), "granted");
    assert.equal(hasAnalyticsConsent(), true);
  });

  it("falls back to 'unknown' when storage is unreadable", () => {
    // Safari private mode and blocked-cookie settings make localStorage throw on access.
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem() {
          throw new Error("SecurityError");
        },
        setItem() {
          throw new Error("SecurityError");
        },
      },
    };
    assert.equal(currentConsent(), "unknown");
    assert.equal(hasAnalyticsConsent(), false);
  });
});

describe("storeConsent", () => {
  it("persists a grant under the versioned key", () => {
    const { data } = installStorage();
    storeConsent("granted");

    const raw = data.get(CONSENT_STORAGE_KEY);
    assert.ok(raw, "a record should have been written");
    assert.equal(parseStoredConsent(raw)?.analytics, "granted");
    assert.equal(parseStoredConsent(raw)?.version, CONSENT_VERSION);
  });

  it("persists a denial so the visitor is not asked repeatedly", () => {
    const { data } = installStorage();
    storeConsent("denied");
    assert.equal(parseStoredConsent(data.get(CONSENT_STORAGE_KEY) ?? null)?.analytics, "denied");
  });

  it("does not throw when storage rejects the write", () => {
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: () => null,
        setItem() {
          throw new Error("QuotaExceededError");
        },
      },
    };
    // The choice still applies to this page view; it just will not be remembered.
    assert.doesNotThrow(() => storeConsent("granted"));
  });

  it("records when the decision was made", () => {
    installStorage();
    const record = storeConsent("granted");
    assert.ok(
      !Number.isNaN(Date.parse(record.decidedAt)),
      `decidedAt should be an ISO timestamp, got ${record.decidedAt}`,
    );
  });
});

describe("subscribeToConsent", () => {
  it("is a no-op with no window (server render)", () => {
    removeStorage();
    assert.doesNotThrow(() => {
      const unsubscribe = subscribeToConsent(() => {});
      unsubscribe();
    });
  });

  it("returns an unsubscribe function that removes the listener", () => {
    installStorage();
    const listeners = new Set<() => void>();
    (globalThis as { window?: unknown }).window = {
      localStorage: installStorage().data && {
        getItem: () => null,
        setItem: () => {},
      },
      addEventListener: (_type: string, cb: () => void) => void listeners.add(cb),
      removeEventListener: (_type: string, cb: () => void) => void listeners.delete(cb),
    };

    let calls = 0;
    const unsubscribe = subscribeToConsent(() => {
      calls += 1;
    });
    assert.ok(listeners.size > 0, "should have registered a listener");
    unsubscribe();
    assert.equal(listeners.size, 0, "unsubscribe should remove it");
    assert.equal(calls, 0);
  });
});
