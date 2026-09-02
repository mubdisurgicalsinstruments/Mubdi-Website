"use client";

import Link from "next/link";
import { useCart } from "@/app/components/cart/CartProvider";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M4.5 5.5h1.6l1.4 9.2a1.5 1.5 0 0 0 1.48 1.3h8.4a1.5 1.5 0 0 0 1.48-1.3l1.1-6.7H7.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 11.5h6.2M10 20.5a1 1 0 1 0 0 .01M17 20.5a1 1 0 1 0 0 .01" strokeLinecap="round" />
    </svg>
  );
}

export default function CartIconLink({ className = "" }: { className?: string }) {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className={`relative grid size-11 shrink-0 place-items-center rounded-sm border border-border text-navy transition-colors hover:border-navy/20 hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${className}`}
      aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : "Shopping cart"}
    >
      <span className="size-5">
        <CartIcon />
      </span>
      {itemCount > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-navy px-1 text-[0.65rem] font-bold leading-5 text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}
