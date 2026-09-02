"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { CartItem } from "@/app/lib/cart";
import { cartItemsToQuoteItems } from "@/app/lib/cart-quote-types";

type CartQuoteRequestModalProps = {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
};

type FormState = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  message: string;
};

const initialFormState: FormState = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  country: "",
  message: "",
};

const fieldClass =
  "h-11 w-full rounded-[var(--radius-control)] border border-border bg-white px-3 text-sm text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10";

export default function CartQuoteRequestModal({ open, items, onClose }: CartQuoteRequestModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const successPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isSubmitting, onClose]);

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setFieldErrors({});
      setSubmitError("");
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isSuccess || !modalScrollRef.current || !successPanelRef.current) return;

    const scrollContainer = modalScrollRef.current;
    const panel = successPanelRef.current;

    requestAnimationFrame(() => {
      scrollContainer.scrollTop = 0;
      const containerRect = scrollContainer.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const offsetWithinContainer =
        panelRect.top - containerRect.top + scrollContainer.scrollTop;
      const targetScroll =
        offsetWithinContainer + panelRect.height / 2 - scrollContainer.clientHeight / 2;
      scrollContainer.scrollTop = Math.max(0, targetScroll);
      panel.focus({ preventScroll: true });
    });
  }, [isSuccess]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    }
    if (submitError) setSubmitError("");
  }

  function validateClientForm(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required.";
    if (!form.companyName.trim()) errors.companyName = "Company name is required.";
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.country.trim()) errors.country = "Country is required.";
    if (!form.phone.trim()) errors.phone = "Phone / WhatsApp is required.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isSuccess) return;

    if (!validateClientForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/cart-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          companyName: form.companyName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          message: form.message,
          items: cartItemsToQuoteItems(items),
        }),
      });

      const result = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(result.error || "We could not send your quote request.");
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setIsSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not send your quote request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-navy/55 backdrop-blur-[1px]"
        aria-label="Close quote request form"
        disabled={isSubmitting}
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.25rem] border border-border bg-white shadow-[0_24px_60px_rgba(10,35,66,0.18)] sm:rounded-[1.25rem]"
      >
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy">
                Request a Quote
              </p>
              <h2 id={titleId} className="mt-1 text-xl font-bold tracking-[-0.03em] text-navy sm:text-2xl">
                Submit your cart for pricing
              </h2>
            </div>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] border border-border text-navy transition hover:bg-warm-gray disabled:opacity-50"
              aria-label="Close"
              disabled={isSubmitting}
              onClick={onClose}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>
        </div>

        <div ref={modalScrollRef} className="overflow-y-auto px-5 py-5 sm:px-6">
          {isSuccess ? (
            <div ref={successPanelRef} tabIndex={-1} className="py-8 text-center outline-none">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-navy/8 text-2xl font-bold text-navy">
                ✓
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-navy">
                Quote Request Sent
              </h3>
              <p className="body-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
                Thank you. Your quote request has been received. Our team will get back to you shortly.
              </p>
              <button type="button" className="btn-primary mt-8 min-w-40" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <section className="rounded-xl border border-border bg-warm-gray/35 p-4">
                <h3 className="text-sm font-semibold text-navy">Quote Items</h3>
                <ul className="mt-3 space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-[var(--radius-control)] border border-border bg-white px-3 py-3 text-sm"
                    >
                      <p className="font-semibold text-navy">{item.productName}</p>
                      <p className="mt-1 text-muted">
                        Category:{" "}
                        <span className="text-navy">
                          {item.categoryName} / {item.subcategoryName}
                        </span>
                      </p>
                      <p className="mt-1 text-muted">
                        Size:{" "}
                        <span className="text-navy">
                          {item.sizeSpecification?.trim() || "Not specified"}
                        </span>
                      </p>
                      <p className="mt-1 text-muted">
                        Quantity: <span className="font-semibold text-navy">{item.quantity}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-1">
                  Full Name <span className="text-red-700">*</span>
                  <input
                    className={fieldClass}
                    value={form.fullName}
                    autoComplete="name"
                    required
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                  {fieldErrors.fullName ? (
                    <span className="text-sm font-normal text-red-700">{fieldErrors.fullName}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-1">
                  Company Name <span className="text-red-700">*</span>
                  <input
                    className={fieldClass}
                    value={form.companyName}
                    autoComplete="organization"
                    required
                    onChange={(event) => updateField("companyName", event.target.value)}
                  />
                  {fieldErrors.companyName ? (
                    <span className="text-sm font-normal text-red-700">{fieldErrors.companyName}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-1">
                  Email Address <span className="text-red-700">*</span>
                  <input
                    type="email"
                    className={fieldClass}
                    value={form.email}
                    autoComplete="email"
                    required
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                  {fieldErrors.email ? (
                    <span className="text-sm font-normal text-red-700">{fieldErrors.email}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-1">
                  Phone / WhatsApp <span className="text-red-700">*</span>
                  <input
                    className={fieldClass}
                    value={form.phone}
                    autoComplete="tel"
                    required
                    onChange={(event) => updateField("phone", event.target.value)}
                  />
                  {fieldErrors.phone ? (
                    <span className="text-sm font-normal text-red-700">{fieldErrors.phone}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-2">
                  Country <span className="text-red-700">*</span>
                  <input
                    className={fieldClass}
                    value={form.country}
                    autoComplete="country-name"
                    required
                    onChange={(event) => updateField("country", event.target.value)}
                  />
                  {fieldErrors.country ? (
                    <span className="text-sm font-normal text-red-700">{fieldErrors.country}</span>
                  ) : null}
                </label>

                <label className="grid gap-1.5 text-sm font-medium text-navy sm:col-span-2">
                  Message / Additional Requirements
                  <textarea
                    rows={4}
                    className={`${fieldClass} h-auto resize-y py-2.5`}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                  />
                </label>
              </div>

              {submitError ? (
                <p className="rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {submitError}
                </p>
              ) : null}

              <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending quote request..." : "Submit Quote Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
