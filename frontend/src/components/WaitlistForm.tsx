"use client";

import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const inputClasses =
  "w-full rounded-[8px] border border-line bg-ink px-4 py-3 text-sm text-snow placeholder:text-fog-dim transition-colors focus:border-accent-soft focus:outline-none focus:ring-2 focus:ring-accent/30";

interface WaitlistFormProps {
  product: "crack-it" | "meeting-assistant";
  productName: string;
}

export function WaitlistForm({ product, productName }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setErrorMsg("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_API_URL) {
        console.warn(
          "NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:4000",
        );
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), product }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setErrorMsg(body?.message ?? "Something went wrong — please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-[8px] border border-ok/40 bg-ok/10 px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
        <p className="text-sm text-ok">
          You&apos;re on the list for <strong>{productName}</strong>. We&apos;ll reach out before launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor={`waitlist-email-${product}`} className="sr-only">
        Email address
      </label>
      <input
        id={`waitlist-email-${product}`}
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errorMsg) setErrorMsg(null);
        }}
        disabled={status === "submitting"}
        className={`${inputClasses} flex-1 ${errorMsg ? "border-err" : ""}`}
        aria-invalid={!!errorMsg}
        aria-describedby={errorMsg ? `waitlist-error-${product}` : undefined}
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
      {errorMsg && (
        <p
          id={`waitlist-error-${product}`}
          role="alert"
          className="flex items-center gap-1.5 text-xs text-err sm:col-span-2"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {errorMsg}
        </p>
      )}
    </form>
  );
}
