"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { catalogCategorySummaries } from "@/app/lib/catalog-nav";

const categories = catalogCategorySummaries.map((category) => ({
  name: category.name,
  description: category.description,
  image: category.image,
  href: `/products/${category.slug}`,
}));

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProductCategories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageAvailable, setImageAvailable] = useState(true);
  const activeCategory = categories[activeIndex];

  function previewCategory(index: number) {
    setActiveIndex(index);
    setImageAvailable(true);
  }

  return (
    <section id="categories" className="scroll-mt-28 overflow-hidden bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex max-w-2xl flex-col gap-5">
          <p className="section-label">
            <span className="section-label-rule" />
            Product Portfolio
          </p>
          <h2 className="section-heading text-[2rem] sm:text-[2.55rem]">
            Precision instruments for every surgical specialty.
          </h2>
          <p className="body-copy max-w-xl text-base sm:text-[1.05rem]">
            Explore our comprehensive range of precision surgical instruments, organized by specialty and application for distributors, hospitals, surgeons, and medical brands.
          </p>
        </div>

        <div className="mt-10 lg:mt-12 lg:grid lg:grid-cols-[0.7fr_1.3fr] lg:gap-10 xl:gap-14">
          <div className="hidden border-l border-border lg:block" aria-label="Product categories">
            {categories.map((category, index) => {
              const isActive = activeIndex === index;

              return (
                <Link
                  key={category.href}
                  href={category.href}
                  onMouseEnter={() => previewCategory(index)}
                  onFocus={() => previewCategory(index)}
                  className={`group flex w-full items-center justify-between border-b border-border-light py-4 text-left last:border-b-0 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${
                    isActive ? "text-navy" : "text-muted hover:text-navy"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className={`text-[0.65rem] font-bold tracking-[0.14em] ${isActive ? "text-navy" : "text-muted-light"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-sm font-semibold transition-transform duration-300 ${isActive ? "translate-x-1" : ""}`}>
                      {category.name}
                    </span>
                  </span>
                  <span className={`size-4 transition-all duration-300 ${isActive ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}>
                    <ArrowIcon />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="lg:hidden">
            <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category, index) => {
                const isActive = activeIndex === index;

                return (
                  <Link
                    key={category.href}
                    href={category.href}
                    onClick={() => previewCategory(index)}
                    className={`shrink-0 snap-start rounded-lg border px-4 py-3 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                      isActive ? "border-navy bg-navy text-white" : "border-border bg-white text-navy-muted"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <Link href={activeCategory.href} className="block" aria-label={`Open ${activeCategory.name}`}>
              <div className="relative aspect-[1.27/1] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_16px_34px_rgba(10,35,66,0.07)] sm:rounded-[1.75rem]" aria-live="polite">
                <Image
                  key={activeCategory.image}
                  src={activeCategory.image}
                  alt={`${activeCategory.name} surgical instruments`}
                  fill
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  className={`object-cover transition-opacity duration-500 ${imageAvailable ? "animate-[showcase-fade_500ms_ease-out_both]" : "opacity-0"}`}
                  onError={() => setImageAvailable(false)}
                />
                {!imageAvailable && (
                  <div className="absolute inset-0 flex items-end bg-surface p-7 sm:p-10">
                    <span className="max-w-sm text-2xl font-bold leading-tight tracking-[-0.035em] text-navy sm:text-3xl">
                      {activeCategory.name}
                    </span>
                  </div>
                )}

                <span
                  className={`absolute left-6 top-6 rounded-md border px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.16em] sm:left-8 sm:top-8 ${
                    imageAvailable ? "border-white/30 bg-navy/30 text-white backdrop-blur-md" : "border-border bg-white/80 text-navy"
                  }`}
                >
                  PRODUCT PORTFOLIO
                </span>
              </div>
            </Link>

            <div className="mt-7 flex flex-col justify-between gap-6 sm:flex-row sm:items-end sm:gap-10">
              <div className="max-w-xl">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy">Selected category</p>
                <h3 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-navy sm:text-3xl">{activeCategory.name}</h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-navy-muted sm:text-base">{activeCategory.description}</p>
              </div>
              <Link
                href={activeCategory.href}
                className="btn-primary shrink-0"
              >
                View Products
                <span className="size-4">
                  <ArrowIcon />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
