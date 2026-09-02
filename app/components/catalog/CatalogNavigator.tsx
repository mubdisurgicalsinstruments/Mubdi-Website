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
    <div>
      <div
        className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:hidden [&::-webkit-scrollbar]:hidden"
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
              className={`shrink-0 rounded-lg border px-3.5 py-3 text-left text-sm font-semibold transition-colors ${
                isActive
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-white text-navy-muted"
              }`}
            >
              {item.name}
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
            <div className="relative aspect-[1.27/1] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_34px_rgba(10,35,66,0.07)] sm:rounded-[1.75rem]">
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
            <h2 className="section-heading mt-2 text-[2rem] sm:text-[2.45rem] lg:text-[2.2rem] xl:text-[2.45rem]">
              {activeItem.name}
            </h2>
            <p className="body-copy mt-3 line-clamp-4 text-sm sm:text-base lg:line-clamp-5">
              {activeItem.description}
            </p>
            <Link href={activeItem.href} className="btn-primary mt-5 w-fit sm:mt-6">
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
