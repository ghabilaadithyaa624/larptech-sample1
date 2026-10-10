"use client";

import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { API_BASE_URL, parseApiError } from "@/lib/apiBase";
import { trackEvent } from "@/lib/analytics";
import { waitlistSchema, type WaitlistProduct } from "@/lib/validators";

const inputClasses =
  "w-full rounded-[8px] border border-line bg-ink px-4 py-3 text-sm text-snow placeholder:text-fog-dim transition-colors focus:border-accent-soft focus:outline-none focus:ring-2 focus:ring-accent/30";

interface WaitlistFormProps {
  product: WaitlistProduct;
  productName: string;
}

export function WaitlistForm({ product, productName }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Same rule the server applies, so the user sees one consistent message rather than
    // passing client validation and then being rejected by the API.
    const parsed = waitlistSchema.safeParse({ email, product });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `parsed.data.email` is already normalised, and the server normalises again — the
        // belt and braces are what let case variants collapse into one signup.
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const raw: unknown = await res.json().catch(() => null);
        const parsedErr = parseApiError(raw, "Something went wrong — please try again.");
        setErrorMsg(parsedErr.message);
        setStatus("error");
        return;
      }
      // A repeat signup also returns success, and is reported identically. Confirming that
      // an address is already registered would leak membership of the list.
      trackEvent("waitlist_signup", { product });
      setStatus("success");
    } catch {
      setErrorMsg("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className="flex items-center gap-3 rounded-[8px] border border-ok/40 bg-ok/10 px-4 py-3"
        role="status"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
        <p className="text-sm text-ok">
          You&apos;re on the list for <strong>{productName}</strong>. We&apos;ll reach out before launch.
        </p>
      </div>
    );
  }

  const errorId = `waitlist-error-${product}`;

  return (
    // `noValidate` so our own message is shown instead of the browser's, which cannot be
    // styled and disappears on the next keystroke.
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {/* The row holds only the input and the button. The error belongs below it: as a direct
          child of the flex row it was laid out beside the button on wide screens, which
          squeezed the message into a narrow column at the end of the row. */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={`waitlist-email-${product}`} className="sr-only">
          Email address
        </label>
        <input
          id={`waitlist-email-${product}`}
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          disabled={status === "submitting"}
          className={`${inputClasses} flex-1 ${errorMsg ? "border-err" : ""}`}
          aria-invalid={!!errorMsg}
          aria-describedby={errorMsg ? errorId : undefined}
        />
        <Button type="submit" disabled={status === "submitting"} className="shrink-0">
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Joining…
            </>
          ) : (
            "Join waitlist"
          )}
        </Button>
      </div>

      {errorMsg && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-err"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {errorMsg}
        </p>
      )}
    </form>
  );
}
