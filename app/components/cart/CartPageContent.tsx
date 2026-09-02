"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/app/components/cart/CartProvider";
import CartQuoteRequestModal from "@/app/components/cart/CartQuoteRequestModal";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import type { CartItem } from "@/app/lib/cart";
import { cartItemsToQuoteItems } from "@/app/lib/cart-quote-types";
import { openWhatsAppQuoteUrl, requestWhatsAppQuote } from "@/app/lib/open-whatsapp-quote";

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3.5 8h9" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3.5 4.5h9M6 4.5V3.5a1 1 0 0 1 1-1h1.5a1 1 0 0 1 1 1v1M6.5 7.5v4.5M9.5 7.5v4.5M4.5 4.5l.5 8.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CartLineItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const productHref = `/products/${item.categorySlug}/${item.subcategorySlug}/${item.productSlug}`;

  return (
    <article className="grid min-w-0 gap-4 border-b border-border py-4 last:border-b-0 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center sm:py-5">
      <Link
        href={productHref}
        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-warm-gray/40"
      >
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          sizes="88px"
          className="object-contain p-2"
        />
      </Link>

      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">
          {item.categoryName} / {item.subcategoryName}
        </p>
        <Link href={productHref} className="mt-1 block text-base font-semibold text-navy hover:underline">
          {item.productName}
        </Link>
        {item.sizeSpecification ? (
          <p className="mt-1.5 text-sm text-muted">
            Size: <span className="font-medium text-navy">{item.sizeSpecification}</span>
          </p>
        ) : null}
        <p className="mt-1 text-sm text-muted">Price on request</p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
          onClick={() => onRemove(item.id)}
        >
          <span className="size-4">
            <TrashIcon />
          </span>
          Remove
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="inline-flex items-center rounded-[var(--radius-control)] border border-border bg-white">
          <button
            type="button"
            className="grid size-9 place-items-center text-navy transition-colors hover:bg-warm-gray"
            aria-label={`Decrease quantity of ${item.productName}`}
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            <span className="size-3.5">
              <MinusIcon />
            </span>
          </button>
          <span className="min-w-9 border-x border-border px-2 text-center text-sm font-semibold text-navy">
            {item.quantity}
          </span>
          <button
            type="button"
            className="grid size-9 place-items-center text-navy transition-colors hover:bg-warm-gray"
            aria-label={`Increase quantity of ${item.productName}`}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            <span className="size-3.5">
              <PlusIcon />
            </span>
          </button>
        </div>
        <p className="text-sm font-semibold text-navy">Price on request</p>
      </div>
    </article>
  );
}

export default function CartPageContent() {
  const { items, removeItem, updateQuantity } = useCart();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isWhatsAppSubmitting, setIsWhatsAppSubmitting] = useState(false);

  async function handleWhatsAppQuote() {
    setIsWhatsAppSubmitting(true);

    try {
      const result = await requestWhatsAppQuote({
        source: "cart",
        items: cartItemsToQuoteItems(items),
      });
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

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-10">
        <p className="section-label justify-center">
          <span className="section-label-rule" />
          Selected Instruments
        </p>
        <h1 className="section-heading mt-3 text-4xl sm:text-5xl">No instruments selected</h1>
        <p className="body-copy mx-auto mt-4 max-w-md">
          Browse our surgical instrument range and add instruments to your list, or request a quote for custom manufacturing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={PRODUCTS_HOME_HREF} className="btn-primary">
            Browse Products
          </Link>
          <Link href="/#inquiry" className="btn-secondary">
            Request a Quote
          </Link>
        </div>
      </section>
    );
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
      <p className="section-label">
        <span className="section-label-rule" />
        Selected Instruments
      </p>
      <h1 className="section-heading mt-2 text-[1.75rem] leading-[1.15] sm:text-5xl sm:leading-[1.12]">Your Instrument List</h1>
      <p className="body-copy mt-2 max-w-2xl text-[0.9375rem] leading-relaxed sm:mt-3 sm:text-base sm:leading-[1.75]">
        Review your selected instruments and submit your requirements for a quotation.
      </p>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8">
        <div className="min-w-0 rounded-xl border border-border bg-white px-3 sm:px-5">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              onRemove={removeItem}
              onUpdateQuantity={updateQuantity}
            />
          ))}
        </div>

        <aside className="rounded-xl border border-border bg-warm-gray/35 p-5 lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold text-navy">Quote Request</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Instruments</dt>
              <dd className="font-semibold text-navy">{totalQuantity}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <dt className="font-semibold text-navy">Quotation</dt>
              <dd className="font-semibold text-navy">Price on request</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={isWhatsAppSubmitting}
              onClick={handleWhatsAppQuote}
            >
              {isWhatsAppSubmitting ? "Opening WhatsApp..." : "Request Quote via WhatsApp"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => setIsQuoteModalOpen(true)}>
              Request Quote via Email
            </button>
            <Link href={PRODUCTS_HOME_HREF} className="text-link justify-center text-sm">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
      </section>

      <CartQuoteRequestModal
        open={isQuoteModalOpen}
        items={items}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  );
}
