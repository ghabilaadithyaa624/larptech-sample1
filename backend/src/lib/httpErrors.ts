/**
 * Predictable, uniform JSON error responses.
 *
 * Before this module the API had no error-handling middleware at all, so anything that
 * reached `next(err)` — a CORS rejection, malformed JSON, an oversized body — fell through
 * to Express's default `finalhandler`, which replies with **HTML** and, whenever
 * NODE_ENV !== "production", includes a stack trace. Two consequences:
 *
 *   1. Clients could not parse the body (`res.json()` throws), so the contact form
 *      degraded to a generic message with no field-level detail.
 *   2. Internal paths and stack frames could be disclosed to the public internet.
 *
 * Contract now guaranteed for every error response:
 *   Content-Type: application/json
 *   { "error": { "code": string, "message": string, "requestId": string } }
 *
 * The requestId is echoed in the response and in the `X-Request-Id` header so an operator
 * can correlate a user-visible failure with the full server-side log entry, which does
 * contain the stack.
 */

import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "./logger";

/** Error thrown by application code to produce a deliberate, client-safe HTTP response. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  /** Fields the client can act on, e.g. per-field validation messages. */
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/** Attach a correlation id to every request and echo it back to the caller. */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  // Only trust an inbound id if it looks like an opaque token; otherwise mint a fresh one.
  const requestId =
    incoming !== undefined && /^[A-Za-z0-9_-]{8,128}$/.test(incoming) ? incoming : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}

/** Terminal 404 handler — unmatched routes get the same JSON shape as everything else. */
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, "not_found", "No route matches this request."));
}

type BodyParserLikeError = Error & {
  type?: string;
  status?: number;
  statusCode?: number;
  body?: unknown;
};

function isBodyParserError(err: BodyParserLikeError): boolean {
  return (
    err.type === "entity.parse.failed" ||
    err.type === "entity.too.large" ||
    err.type === "parameters.too.many" ||
    err.type === "charset.unsupported" ||
    err.type === "encoding.unsupported"
  );
}

/**
 * Map an unknown thrown value onto a client-safe HTTP response.
 * Returns the log level the error should be recorded at.
 */
function classify(err: unknown): { status: number; code: string; message: string; level: "warn" | "error" } {
  if (err instanceof HttpError) {
    return { status: err.status, code: err.code, message: err.message, level: err.status >= 500 ? "error" : "warn" };
  }

  const e = err as BodyParserLikeError;

  // Most specific first. body-parser reports a JSON syntax error as a SyntaxError carrying
  // `.body`, but it also sets type='entity.parse.failed'; checking this case before the
  // generic body-parser branch lets the client distinguish "your JSON is broken" from other
  // unreadable payloads.
  if (e instanceof SyntaxError && "body" in e) {
    return {
      status: 400,
      code: "malformed_json",
      message: "That request wasn't valid JSON. Please retry.",
      level: "warn",
    };
  }

  if (isBodyParserError(e)) {
    if (e.type === "entity.too.large") {
      return {
        status: 413,
        code: "payload_too_large",
        message: "That submission is larger than we accept. Please shorten it and retry.",
        level: "warn",
      };
    }
    return {
      status: 400,
      code: "malformed_request",
      message: "We couldn't read that request. Please retry.",
      level: "warn",
    };
  }

  return {
    status: 500,
    code: "internal_error",
    message: "Something went wrong on our side. Please retry, or email team@larptech.io.",
    level: "error",
  };
}

/**
 * Central error handler. Must be registered last, after all routes.
 *
 * Diagnostic detail (message, stack, request context) is written to the log and never to
 * the response body.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // Express identifies error handlers by arity 4; `next` must stay in the signature.
  _next: NextFunction,
): void {
  const requestId = req.requestId ?? "unknown";
  const { status, code, message, level } = classify(err);

  const logFields: Record<string, unknown> = {
    requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
  };

  if (err instanceof HttpError) {
    if (err.details !== undefined) logFields.details = err.details;
    logFields.errMessage = err.message;
  } else {
    logFields.err = err;
  }

  logger[level]("request_failed", logFields);

  // A response may already be partly written (e.g. a stream failed mid-flight).
  if (res.headersSent) {
    res.end();
    return;
  }

  const body: Record<string, unknown> = {
    error: { code, message, requestId },
  };

  if (err instanceof HttpError && err.details !== undefined) {
    (body.error as Record<string, unknown>).details = err.details;
  }

  res.status(status).json(body);
}
