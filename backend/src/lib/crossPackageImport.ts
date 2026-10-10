/**
 * Module-resolution shim for cross-package test imports.
 *
 * `validatorParity.test.ts` executes `frontend/src/lib/validators.ts` so the two packages'
 * schemas can be compared behaviourally. That file imports `zod`, and Node resolves
 * nested imports relative to the *importing* file — so the import looks for
 * `frontend/node_modules/zod`. On a clean checkout (backend dependencies installed,
 * frontend dependencies not) it fails with MODULE_NOT_FOUND and the whole parity test
 * crashes before asserting anything.
 *
 * This is not hypothetical: CI's backend job runs `npm ci` in `backend/` only, so
 * `npm test` would go red on every run regardless of whether the schemas match. It also
 * means `npm test` silently depends on whether someone once ran `npm install` in
 * `frontend/`.
 *
 * The hook below maps `zod` to the backend's installed copy for requests that originate
 * inside the frontend package. Two deliberate consequences:
 *
 *   - The parity test needs the frontend *source file* (which is in this repo) but not
 *     the frontend's installed dependency tree. One `npm ci` in `backend/` is enough.
 *   - Both files' schemas are built by the same zod runtime, so the comparison tests the
 *     schema definitions — the thing that can actually drift — instead of accidentally
 *     comparing two independent `node_modules` trees as well.
 *
 * Requests from anywhere else resolve normally, and nothing except the bare specifier
 * `"zod"` is ever remapped.
 *
 * `Module._resolveFilename` is the CommonJS resolution entry point (this package compiles
 * to CommonJS — see tsconfig.json). It is technically internal, but it is the same hook
 * used by jest and module-alias, and its signature has been stable across every Node
 * version this project supports.
 */
import Module from "node:module";
import { createRequire } from "node:module";

const requireFromHere = createRequire(__filename);
const backendZod = requireFromHere.resolve("zod");

type ResolveFilename = (
  request: string,
  parent: { filename?: string } | undefined,
  isMain: boolean,
  options?: unknown,
) => string;

const moduleInternals = Module as unknown as { _resolveFilename: ResolveFilename };
const originalResolveFilename = moduleInternals._resolveFilename;

moduleInternals._resolveFilename = function crossPackageResolve(
  request,
  parent,
  isMain,
  options,
) {
  const fromFrontendPackage = /[\\/]frontend[\\/]/.test(parent?.filename ?? "");
  if (request === "zod" && fromFrontendPackage) {
    return backendZod;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

export {};
