"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { MonoLabel } from "@/components/ui/bits";
import { trackEvent } from "@/lib/analytics";
import { SERVICE_OPTIONS } from "@/lib/services";
import { leadSchema, type LeadInput } from "@/lib/validators";

const inputClasses =
  "w-full rounded-[8px] border border-line bg-ink px-4 py-3 text-sm text-snow placeholder:text-fog-dim transition-colors focus:border-accent-soft focus:outline-none focus:ring-2 focus:ring-accent/30";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs text-err" role="alert">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export function ContactForm({ initialService }: { initialService?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const validInitial = SERVICE_OPTIONS.some((o) => o.value === initialService)
    ? (initialService as LeadInput["serviceInterest"])
    : undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      serviceInterest: validInitial,
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_API_URL) {
        console.warn(
          "NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:4000",
        );
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
          fieldErrors?: Record<string, string>;
        } | null;
        if (body?.fieldErrors) {
          // surface server-side field errors inline
          Object.entries(body.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof LeadInput, { message });
          });
        }
        setFormError(body?.message ?? "Something went wrong on our side. Your details are preserved — hit retry.");
        return;
      }
      const body = (await res.json()) as { id?: string };
      trackEvent("generate_lead", { service: values.serviceInterest });
      router.push(
        `/thank-you?service=${encodeURIComponent(values.serviceInterest)}${body.id ? `&ref=${encodeURIComponent(body.id.slice(0, 8))}` : ""}`,
      );
    } catch {
      setFormError("Network error — we couldn't reach the server. Your details are preserved, hit retry.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="card-line rounded-[12px] p-6 sm:p-8">
      <MonoLabel>{"// consultation_request"}</MonoLabel>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-snow">
            Name <span className="text-err">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`${inputClasses} ${errors.name ? "border-err" : ""}`}
            {...register("name")}
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-snow">
            Work email <span className="text-err">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`${inputClasses} ${errors.email ? "border-err" : ""}`}
            {...register("email")}
          />
          <FieldError id="email-error" message={errors.email?.message} />
        </div>

        <div>
          <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-snow">
            Company <span className="text-fog-dim">(optional)</span>
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            placeholder="Analytical Engines Ltd."
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? "company-error" : undefined}
            className={`${inputClasses} ${errors.company ? "border-err" : ""}`}
            {...register("company")}
          />
          <FieldError id="company-error" message={errors.company?.message} />
        </div>

        <div>
          <label htmlFor="serviceInterest" className="mb-1.5 block text-sm font-medium text-snow">
            Service interest <span className="text-err">*</span>
          </label>
          <select
            id="serviceInterest"
            aria-invalid={!!errors.serviceInterest}
            aria-describedby={errors.serviceInterest ? "service-error" : undefined}
            className={`${inputClasses} appearance-none ${errors.serviceInterest ? "border-err" : ""} ${
              validInitial ? "text-snow" : "text-fog-dim"
            }`}
            {...register("serviceInterest")}
          >
            <option value="" disabled selected={!validInitial}>
              Select a service…
            </option>
            {SERVICE_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                selected={validInitial === o.value}
                className="bg-surface text-snow"
              >
                {o.label}
              </option>
            ))}
          </select>
          <FieldError id="service-error" message={errors.serviceInterest?.message} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-snow">
            What are you trying to fix? <span className="text-fog-dim">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="One or two sentences is plenty — e.g. 'Our SDR team can't keep up with inbound and follow-ups slip.'"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            className={`${inputClasses} resize-y ${errors.message ? "border-err" : ""}`}
            {...register("message")}
          />
          <FieldError id="message-error" message={errors.message?.message} />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending request…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Request consultation
            </>
          )}
        </Button>

        {formError && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-[8px] border border-err/40 bg-err/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex items-start gap-2 text-sm text-err">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {formError}
            </p>
            <Button type="submit" variant="outline" size="sm" disabled={isSubmitting} className="shrink-0 border-err/50 text-err hover:border-err hover:bg-err/10">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </Button>
          </div>
        )}

        <p className="text-xs leading-relaxed text-fog-dim">
          We only use these details to reply to your request. No newsletters, no list-selling, no
          sequences — a human reads every submission.
        </p>
      </div>
    </form>
  );
}
