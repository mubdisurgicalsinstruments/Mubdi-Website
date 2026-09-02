"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { EMAIL, PHONE_DISPLAY, WHATSAPP_LINK } from "../lib/constants";
import { openWhatsAppQuoteUrl, requestWhatsAppQuote } from "../lib/open-whatsapp-quote";
import {
  inquiryTypes,
  isInquiryTypeSlug,
  type InquiryTypeSlug,
} from "../lib/manufacturing-services";

export type ProductQuoteContext = {
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string;
  subcategoryName: string;
  imageUrl: string;
};

type RequestQuoteProps = {
  initialProductContext?: ProductQuoteContext | null;
  initialService?: InquiryTypeSlug | "";
};

function matchesProductContext(
  params: URLSearchParams,
  context: ProductQuoteContext | null,
) {
  return Boolean(
    context &&
      params.get("service") === "product-inquiry" &&
      params.get("category") === context.categorySlug &&
      params.get("subcategory") === context.subcategorySlug &&
      params.get("product") === context.productSlug,
  );
}

function ContactIcon({ type }: { type: "email" | "phone" | "whatsapp" | "location" }) {
  const paths = {
    email: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
        <path d="m4.5 7 7.5 5.5L19.5 7" />
      </>
    ),
    phone: (
      <path d="M7.2 3.8 4.8 5.2c-.9.6-1.2 1.7-.8 2.7 1.6 4.1 4.2 6.7 8.3 8.3 1 .4 2.1.1 2.7-.8l1.4-2.4-3.5-2-1.3 1.7c-1.6-.8-2.8-2-3.6-3.6l1.7-1.3-2-3.5Z" />
    ),
    whatsapp: (
      <>
        <path d="M19.5 11.5a7.5 7.5 0 0 1-10.9 6.7L4 19.5l1.3-4.4a7.5 7.5 0 1 1 14.2-3.6Z" />
        <path d="M9 8.2c.2 2.2 1.7 3.7 3.8 3.9M9.5 8l-.5 1 1.1 1.4 1-.5" />
      </>
    ),
    location: (
      <>
        <path d="M19 10c0 5-7 10.5-7 10.5S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.45"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

export default function RequestQuote({
  initialProductContext = null,
  initialService = "",
}: RequestQuoteProps) {
  const [productContext, setProductContext] = useState<ProductQuoteContext | null>(
    initialProductContext,
  );
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryTypeSlug | "">(
    initialProductContext ? "product-inquiry" : initialService,
  );
  const [productOfInterest, setProductOfInterest] = useState(
    initialProductContext?.productName ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWhatsAppSubmitting, setIsWhatsAppSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const successPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSuccess || !successPanelRef.current) return;

    const panel = successPanelRef.current;

    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      const targetScroll =
        window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
      window.scrollTo({ top: Math.max(0, targetScroll), behavior: "auto" });
      panel.focus({ preventScroll: true });
    });
  }, [isSuccess]);

  useEffect(() => {
    const syncContextFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const service = params.get("service");
      const product = params.get("product");
      const hasProductContext = matchesProductContext(params, initialProductContext);

      setProductContext(hasProductContext ? initialProductContext : null);
      setSelectedInquiry(hasProductContext ? "product-inquiry" : isInquiryTypeSlug(service) ? service : "");
      setProductOfInterest(
        hasProductContext ? initialProductContext?.productName ?? "" : product?.trim() ?? "",
      );
    };

    const handleInquirySelection = () => {
      syncContextFromUrl();
    };

    syncContextFromUrl();
    window.addEventListener("popstate", syncContextFromUrl);
    window.addEventListener("quote-service-selected", handleInquirySelection);

    return () => {
      window.removeEventListener("popstate", syncContextFromUrl);
      window.removeEventListener("quote-service-selected", handleInquirySelection);
    };
  }, [initialProductContext]);

  function readInquiryForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const inquirySlug = formData.get("service")?.toString() ?? "";
    const inquiry = inquiryTypes.find((option) => option.slug === inquirySlug);

    return {
      formData,
      inquiry,
      inquirySlug,
    };
  }

  async function handleInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { formData, inquiry, inquirySlug } = readInquiryForm(event.currentTarget);

    setIsWhatsAppSubmitting(true);
    setSubmitError("");

    try {
      const result = await requestWhatsAppQuote({
        source: "inquiry",
        details: {
          inquiryType: inquiry?.title ?? inquirySlug,
          name: formData.get("name")?.toString(),
          company: formData.get("company")?.toString(),
          email: formData.get("email")?.toString(),
          country: formData.get("country")?.toString(),
          productOfInterest: formData.get("product")?.toString(),
          message: formData.get("message")?.toString(),
          productContext: productContext
            ? {
                productName: productContext.productName,
                categoryName: productContext.categoryName,
                subcategoryName: productContext.subcategoryName,
                imageUrl: productContext.imageUrl,
              }
            : null,
        },
      });

      openWhatsAppQuoteUrl(result.whatsappUrl!);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not prepare your WhatsApp quote request.",
      );
    } finally {
      setIsWhatsAppSubmitting(false);
    }
  }

  async function handleEmailQuote(event: MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    const form = button.form;
    if (!form || !form.reportValidity() || isSubmitting || isSuccess) {
      return;
    }

    const { formData, inquiry, inquirySlug } = readInquiryForm(form);

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/inquiry-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name")?.toString(),
          company: formData.get("company")?.toString(),
          email: formData.get("email")?.toString(),
          phone: formData.get("phone")?.toString(),
          country: formData.get("country")?.toString(),
          inquiryType: inquiry?.title ?? inquirySlug,
          inquirySlug: inquirySlug || selectedInquiry,
          productOfInterest: formData.get("product")?.toString(),
          message: formData.get("message")?.toString(),
          productContext: productContext
            ? {
                productName: productContext.productName,
                categoryName: productContext.categoryName,
                subcategoryName: productContext.subcategoryName,
                imageUrl: productContext.imageUrl,
              }
            : null,
        }),
      });

      const result = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(result.error || "We could not send your quote request.");
      }

      button.blur();
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

  return (
    <section className="bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div
          id="inquiry"
          className="scroll-mt-[5.25rem] overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_16px_36px_rgba(10,35,66,0.07)] sm:rounded-[2rem] lg:scroll-mt-[5.75rem]"
        >
          <div className="grid min-w-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0 p-7 sm:p-10 lg:p-12">
              <p className="section-label">
                <span className="section-label-rule" />
                Request a quote
              </p>
              <h2 className="section-heading mt-5 text-[2rem] sm:text-[2.45rem]">
                Tell us what you need to source.
              </h2>
              <p className="body-copy mt-5 max-w-xl text-base">
                Distributors, hospitals, surgeons, medical professionals, and individual buyers can request pricing, product information, MOQ guidance, and manufacturing options. Share your requirements and we&apos;ll respond as soon as possible.
              </p>

              {isSuccess ? (
                <div
                  ref={successPanelRef}
                  tabIndex={-1}
                  className="mt-9 py-8 text-center outline-none"
                >
                  <div className="mx-auto grid size-14 place-items-center rounded-full bg-navy/8 text-2xl font-bold text-navy">
                    ✓
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-navy">
                    Quote Request Sent
                  </h3>
                  <p className="body-copy mx-auto mt-3 max-w-md text-sm sm:text-base">
                    Thank you. Your quote request has been received. Our team will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-8 min-w-40"
                    onClick={() => {
                      setIsSuccess(false);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
              <form className="mt-9 grid gap-5 sm:grid-cols-2" onSubmit={handleInquiry}>
                {productContext && (
                  <>
                    <input type="hidden" name="service" value="product-inquiry" />
                    <input type="hidden" name="productCategory" value={productContext.categoryName} />
                    <input
                      type="hidden"
                      name="productSubcategory"
                      value={productContext.subcategoryName}
                    />
                    <input type="hidden" name="productImage" value={productContext.imageUrl} />
                  </>
                )}
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Name
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Company (Optional)
                  <input
                    name="company"
                    autoComplete="organization"
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Country
                  <input
                    required
                    name="country"
                    autoComplete="country-name"
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy">
                  Phone / WhatsApp
                  <input
                    required
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                <div className="grid gap-2 sm:col-span-2">
                  <label className="grid gap-2 text-sm font-medium text-navy">
                    What can we help you with?
                    <select
                      required
                      name={productContext ? undefined : "service"}
                      value={selectedInquiry}
                      disabled={Boolean(productContext)}
                      onChange={(event) =>
                        setSelectedInquiry(event.target.value as InquiryTypeSlug | "")
                      }
                      className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:cursor-not-allowed disabled:bg-surface disabled:text-navy-muted"
                    >
                      <option value="" disabled hidden>
                        Select an inquiry type
                      </option>
                      {inquiryTypes.map((option) => (
                        <option key={option.slug} value={option.slug}>
                          {option.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs leading-5 text-muted">
                    {productContext
                      ? "Product inquiry details were loaded automatically from the product page."
                      : "Can’t find what you’re looking for? Select General / Other Inquiry and tell us what you need."}
                  </p>
                </div>
                <label className="grid gap-2 text-sm font-medium text-navy sm:col-span-2">
                  Product of Interest
                  <input
                    required
                    name="product"
                    value={productOfInterest}
                    readOnly={Boolean(productContext)}
                    onChange={(event) => {
                      if (!productContext) setProductOfInterest(event.target.value);
                    }}
                    className="h-12 rounded-lg border border-border bg-white px-4 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10 read-only:bg-surface"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-navy sm:col-span-2">
                  Message
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="resize-y rounded-lg border border-border bg-white px-4 py-3 text-sm font-normal text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10"
                  />
                </label>
                {submitError ? (
                  <p
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2"
                    role="alert"
                  >
                    {submitError}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className="btn-primary w-full sm:w-fit"
                    disabled={isWhatsAppSubmitting || isSubmitting}
                  >
                    {isWhatsAppSubmitting ? "Opening WhatsApp..." : "Request Quote via WhatsApp"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary w-full sm:w-fit"
                    disabled={isSubmitting}
                    onClick={handleEmailQuote}
                  >
                    {isSubmitting ? "Sending quote request..." : "Request Quote via Email"}
                  </button>
                </div>
              </form>
              )}
            </div>

            <aside className="min-w-0 bg-navy p-7 text-white sm:p-10 lg:rounded-r-[2rem] lg:p-12">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
                Direct contact
              </p>
              <h2 className="mt-5 text-[1.7rem] font-bold tracking-[-0.035em] sm:text-3xl">
                Prefer to reach us directly?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/70">
                Use WhatsApp or phone for faster follow-up on catalogs, custom manufacturing programs, and quotation requests.
              </p>
              <div className="mt-10 divide-y divide-white/15">
                <div className="flex gap-4 py-5 first:pt-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white/85">
                    <span className="size-5">
                      <ContactIcon type="email" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/50">
                      Email
                    </span>
                    <span className="mt-1.5 block break-all text-sm font-medium">{EMAIL}</span>
                  </span>
                </div>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`}
                  className="flex gap-4 py-5 transition-colors hover:text-white/85"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white/85">
                    <span className="size-5">
                      <ContactIcon type="phone" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/50">
                      Phone
                    </span>
                    <span className="mt-1.5 block text-sm font-medium">{PHONE_DISPLAY}</span>
                  </span>
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-4 py-5 transition-colors hover:text-white/85"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white/85">
                    <span className="size-5">
                      <ContactIcon type="whatsapp" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/50">
                      WhatsApp
                    </span>
                    <span className="mt-1.5 block text-sm font-medium">{PHONE_DISPLAY}</span>
                  </span>
                </a>
                <div className="flex gap-4 pt-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/15 text-white/85">
                    <span className="size-5">
                      <ContactIcon type="location" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-white/50">
                      Location
                    </span>
                    <span className="mt-1.5 block text-sm font-medium">Sialkot, Pakistan</span>
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
