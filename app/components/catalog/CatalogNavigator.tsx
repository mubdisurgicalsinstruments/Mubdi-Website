"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type CatalogNavigationItem = {
  name: string;
  description: string;
  image: string;
  href: string;
};

type CatalogNavigatorProps = {
  items: CatalogNavigationItem[];
  label: string;
  actionLabel: string;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CatalogNavigator({
  items,
  label,
  actionLabel,
}: CatalogNavigatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  if (!activeItem) {
    return null;
  }

  return (
    <div className="min-w-0 max-w-full">
      <div
        className="-mx-4 mb-3 flex max-w-[100vw] snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x xl:hidden [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={label}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              key={item.href}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(index)}
              className={`max-w-[min(85vw,18rem)] shrink-0 snap-start rounded-lg border px-3 py-2.5 text-left text-[0.8125rem] font-semibold leading-snug transition-colors sm:px-3.5 sm:text-sm ${
                isActive
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-white text-navy-muted"
              }`}
            >
              <span className="line-clamp-2">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="xl:grid xl:grid-cols-[0.7fr_1.3fr] xl:gap-14">
        <div className="hidden border-l border-border xl:block" aria-label={label}>
          {items.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className={`group flex w-full items-center justify-between border-b border-border-light py-3 pl-4 text-left last:border-b-0 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${
                  isActive ? "text-navy" : "text-muted hover:text-navy"
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`text-[0.65rem] font-bold tracking-[0.14em] ${
                      isActive ? "text-navy" : "text-muted-light"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-sm font-semibold transition-transform duration-300 ${
                      isActive ? "translate-x-1" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </span>
                <span
                  className={`size-4 transition-all duration-300 ${
                    isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                  }`}
                >
                  <ArrowIcon />
                </span>
              </Link>
            );
          })}
        </div>

        <div
          key={activeItem.href}
          className="grid gap-5 animate-[product-soft-fade_200ms_ease-out] sm:gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start lg:gap-8 motion-reduce:animate-none"
          aria-live="polite"
        >
          <Link href={activeItem.href} className="block" aria-label={`Open ${activeItem.name}`}>
            <div className="relative aspect-[16/11] max-h-[min(38vh,15rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-[0_16px_34px_rgba(10,35,66,0.07)] sm:max-h-none sm:aspect-[1.27/1] sm:rounded-2xl sm:rounded-[1.75rem]">
              <Image
                key={`${activeItem.image}-${activeItem.name}`}
                src={activeItem.image}
                alt={activeItem.name}
                fill
                preload={activeIndex === 0}
                sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) calc(100vw - 4rem), (max-width: 1279px) 58vw, 32rem"
                className="object-cover animate-[showcase-fade_500ms_ease-out_both]"
              />
            </div>
          </Link>

          <div className="flex min-w-0 flex-col">
            <p className="section-label">
              <span className="section-label-rule" />
              {label}
            </p>
            <h2 className="section-heading mt-1.5 text-[1.5rem] leading-[1.15] sm:mt-2 sm:text-[2.45rem] lg:text-[2.2rem] lg:leading-[1.12] xl:text-[2.45rem]">
              {activeItem.name}
            </h2>
            <p className="body-copy mt-2 line-clamp-4 text-sm leading-relaxed sm:mt-3 sm:text-base lg:line-clamp-5">
              {activeItem.description}
            </p>
            <Link href={activeItem.href} className="btn-primary mt-4 w-full sm:mt-6 sm:w-fit">
              {actionLabel}
              <span className="size-4">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
