"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { CatalogSearchHit } from "@/app/lib/catalog-search";
import { searchCatalog } from "@/app/lib/catalog-search";

type CatalogSearchProps = {
  index: CatalogSearchHit[];
  initialQuery?: string;
  compact?: boolean;
  className?: string;
  variant?: "inline" | "navbar";
  onOpenChange?: (open: boolean) => void;
};

const TYPE_LABEL: Record<CatalogSearchHit["type"], string> = {
  category: "Category",
  subcategory: "Subcategory",
  product: "Product",
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="m7 7 10 10M17 7 7 17" strokeLinecap="round" />
    </svg>
  );
}

export default function CatalogSearch({
  index,
  initialQuery = "",
  compact = false,
  className = "",
  variant = "inline",
  onOpenChange,
}: CatalogSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(variant === "inline");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isDesktop, setIsDesktop] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const limit = variant === "navbar" || compact ? 8 : 24;
  const results = useMemo(
    () => searchCatalog(deferredQuery, index, limit),
    [deferredQuery, index, limit],
  );
  const showResults = deferredQuery.trim().length > 0 && (variant === "inline" || isOpen);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [deferredQuery, results.length]);

  useEffect(() => {
    if (variant !== "navbar") return;
    const media = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [variant]);

  useEffect(() => {
    if (variant !== "navbar" || !isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setIsOpen(false);
        onOpenChange?.(false);
        setQuery("");
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen, variant, onOpenChange]);

  useEffect(() => {
    if (variant === "navbar" && isOpen) {
      const frame = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [isOpen, variant]);

  function closeNavbarSearch() {
    setIsOpen(false);
    onOpenChange?.(false);
    setQuery("");
    setActiveIndex(-1);
  }

  function openNavbarSearch() {
    setIsOpen(true);
    onOpenChange?.(true);
  }

  function navigateTo(href: string) {
    if (variant === "navbar") {
      closeNavbarSearch();
    }
    router.push(href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (variant === "navbar") {
        closeNavbarSearch();
      } else {
        setQuery("");
        setActiveIndex(-1);
      }
      return;
    }

    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      navigateTo(results[activeIndex].href);
    }
  }

  const resultsPanel = showResults ? (
    <div
      id={listId}
      className={`overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_34px_rgba(10,35,66,0.12)] ${
        variant === "navbar"
          ? "absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(24rem,70vh)] overflow-y-auto"
          : compact
            ? "mt-3 max-h-80 overflow-y-auto"
            : "mt-3"
      }`}
      role="listbox"
      aria-label="Search results"
    >
      {results.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted">No matches found.</p>
      ) : (
        <ul>
          {results.map((hit, indexPosition) => {
            const isActive = indexPosition === activeIndex;

            return (
              <li key={hit.href} className="border-b border-border-light last:border-b-0">
                <Link
                  id={`${listId}-option-${indexPosition}`}
                  href={hit.href}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(indexPosition)}
                  onClick={() => {
                    if (variant === "navbar") closeNavbarSearch();
                  }}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive ? "bg-surface" : "hover:bg-surface"
                  }`}
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                    <Image src={hit.image} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy">{hit.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {TYPE_LABEL[hit.type]} · {hit.breadcrumb}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  function handleCloseControl() {
    if (query.trim()) {
      setQuery("");
      setActiveIndex(-1);
      inputRef.current?.focus();
      return;
    }
    closeNavbarSearch();
  }

  const searchField = (
    <div ref={panelRef} className="relative flex w-full items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <label htmlFor={inputId} className="sr-only">
          Search catalog
        </label>
        <span className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search products, categories, and instruments..."
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          className="h-11 w-full rounded-lg border border-border bg-white pl-11 pr-3 text-sm text-navy outline-none transition duration-200 focus:border-navy focus:ring-4 focus:ring-navy/10"
        />
        {resultsPanel}
      </div>
      <button
        type="button"
        aria-label={query.trim() ? "Clear search" : "Close search"}
        onClick={handleCloseControl}
        className="grid size-11 shrink-0 place-items-center rounded-sm border border-border text-navy transition-colors hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <span className="size-4">
          <CloseIcon />
        </span>
      </button>
    </div>
  );

  if (variant === "navbar") {
    return (
      <div ref={rootRef} className={`relative shrink-0 ${className}`}>
        <button
          type="button"
          aria-label="Open catalog search"
          aria-expanded={isOpen}
          aria-hidden={isOpen}
          tabIndex={isOpen ? -1 : 0}
          onClick={openNavbarSearch}
          className={`grid size-11 place-items-center rounded-sm border border-border text-navy transition-colors hover:border-navy/20 hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
            isOpen ? "pointer-events-none invisible" : ""
          }`}
        >
          <span className="size-[1.15rem]">
            <SearchIcon />
          </span>
        </button>

        {/* Expand left from the trigger slot so × sits next to Request a Quote with the same gap. */}
        {isOpen && isDesktop && (
          <div className="absolute right-0 top-1/2 z-30 w-[min(36rem,calc(100vw-14rem))] -translate-y-1/2">
            {searchField}
          </div>
        )}

        {isOpen && !isDesktop && (
          <div>
            <div className="fixed inset-0 z-40 bg-navy/25" onClick={closeNavbarSearch} />
            <div className="fixed inset-x-3 top-[5.75rem] z-50 rounded-xl border border-border bg-white p-3 shadow-[0_16px_34px_rgba(10,35,66,0.14)] lg:top-[6.25rem]">
              {searchField}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        Search catalog
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search instruments, categories..."
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          className={`w-full rounded-lg border border-border bg-white text-navy outline-none transition focus:border-navy focus:ring-4 focus:ring-navy/10 ${
            compact ? "h-11 px-4 text-sm" : "h-12 px-4 text-sm sm:h-14 sm:text-base"
          }`}
        />
      </div>
      {resultsPanel}
    </div>
  );
}
