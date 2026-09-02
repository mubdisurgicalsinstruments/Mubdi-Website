"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { openWhatsAppQuoteUrl, requestWhatsAppQuote } from "@/app/lib/open-whatsapp-quote";
import { type MouseEvent, useState } from "react";

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type CatalogInquiryProps = {
  productName?: string;
  categoryName?: string;
  subcategoryName?: string;
};

export default function CatalogInquiry({
  productName,
  categoryName,
  subcategoryName,
}: CatalogInquiryProps = {}) {
  const pathname = usePathname();
  const [isWhatsAppSubmitting, setIsWhatsAppSubmitting] = useState(false);

  async function handleWhatsAppClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsWhatsAppSubmitting(true);

    try {
      const result = await requestWhatsAppQuote(
        productName
          ? {
              source: "product",
              details: {
                productName,
                categoryName,
                subcategoryName,
              },
            }
          : { source: "general" },
      );
      openWhatsAppQuoteUrl(result.whatsappUrl!);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "We could not prepare your WhatsApp quote request.",
      );
    } finally {
      setIsWhatsAppSubmitting(false);
    }
  }

  function handleInquiryLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const isHome = pathname === "/" || pathname === "";
    if (!isHome) return;

    event.preventDefault();
    window.history.pushState(null, "", "/#inquiry");
    const target = document.getElementById("inquiry");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section className="mt-8 rounded-[1.75rem] bg-navy px-6 py-10 text-center shadow-[0_16px_36px_rgba(10,35,66,0.16)] sm:mt-10 sm:rounded-[2rem] sm:px-12 sm:py-12">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">
        Custom sourcing support
      </p>
      <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
        Can&apos;t find the instrument you&apos;re looking for?
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
        We manufacture hundreds of surgical instruments beyond our online catalog. Contact our team
        for custom manufacturing, private label solutions, custom branding, or special product
        requirements.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          disabled={isWhatsAppSubmitting}
          onClick={handleWhatsAppClick}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isWhatsAppSubmitting ? "Opening WhatsApp..." : "Request Quote via WhatsApp"}
          <span className="size-4">
            <ArrowUpRightIcon />
          </span>
        </button>
        <Link
          href="/#inquiry"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          onClick={handleInquiryLinkClick}
        >
          Request Quote via Email
          <span className="size-4">
            <ArrowUpRightIcon />
          </span>
        </Link>
      </div>
    </section>
  );
}
