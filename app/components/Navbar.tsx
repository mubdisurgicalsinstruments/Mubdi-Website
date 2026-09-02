"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import CartIconLink from "@/app/components/cart/CartIconLink";
import CatalogSearch from "@/app/components/catalog/CatalogSearch";
import { catalogCategoryLinks } from "@/app/lib/catalog-nav";
import type { CatalogSearchHit } from "@/app/lib/catalog-search";
import { COMPANY_NAME } from "@/app/lib/constants";

const navigationItems = [
  { label: "Custom Manufacturing", href: "/#oem" },
  { label: "About Us", href: "/#about" },
  { label: "Contact Us", href: "/#inquiry" },
];

function BrandMark() {
  return (
    <span
      className="grid size-12 shrink-0 place-items-center bg-navy text-lg font-semibold text-white shadow-[0_10px_22px_rgba(10,35,66,0.16)] lg:size-[3.25rem]"
      style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}
      aria-hidden="true"
    >
      M
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-full"
      aria-hidden="true"
    >
      <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

const navLinkClass =
  "inline-flex h-10 shrink-0 items-center whitespace-nowrap text-[0.8125rem] font-medium leading-none tracking-[0.01em] text-navy-muted transition-colors duration-200 hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy";

const productsMenuItemClass =
  "block rounded-lg px-3 py-2 text-sm text-navy-muted transition-colors hover:bg-warm-gray hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

const productsMenuPrimaryClass =
  "block rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

function scrollToHash(hash: string, behavior: ScrollBehavior = "smooth") {
  const target = document.getElementById(hash);
  if (!target) return false;
  target.scrollIntoView({ behavior, block: "start" });
  return true;
}

export default function Navbar({ searchIndex = [] }: { searchIndex?: CatalogSearchHit[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const productsMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProductsOpen(false);
  };

  const closeProductsMenu = () => setIsProductsOpen(false);

  function handleHashLinkClick(event: ReactMouseEvent<HTMLAnchorElement>, href: string) {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const hash = href.slice(hashIndex + 1);
    if (!hash) return;

    event.preventDefault();
    closeMenu();
    closeProductsMenu();

    const isHome = pathname === "/" || pathname === "";
    if (isHome) {
      window.history.pushState(null, "", `/#${hash}`);
      scrollToHash(hash, "smooth");
      return;
    }

    router.push(`/#${hash}`);
  }

  useEffect(() => {
    if (pathname !== "/") return;

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    let cancelled = false;
    const tryScroll = (behavior: ScrollBehavior) => {
      if (cancelled) return;
      if (!scrollToHash(hash, behavior)) {
        window.setTimeout(() => {
          if (!cancelled) scrollToHash(hash, behavior);
        }, 50);
      }
    };

    const frame = window.requestAnimationFrame(() => tryScroll("smooth"));
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isProductsOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProductsOpen(false);
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!productsMenuRef.current?.contains(event.target as Node)) {
        setIsProductsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isProductsOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/90 bg-white/98 shadow-[0_2px_14px_rgba(10,35,66,0.04)] backdrop-blur-sm">
      <div className="mx-auto grid h-[5.25rem] max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 sm:gap-5 sm:px-8 lg:h-[5.75rem] lg:gap-6 lg:px-10">
        <Link
          href="/"
          className="relative z-20 flex shrink-0 items-center gap-3.5 rounded-sm transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy"
          aria-label={`${COMPANY_NAME} home`}
          onClick={closeMenu}
        >
          <BrandMark />
          <span className="hidden whitespace-nowrap text-[0.78rem] font-bold uppercase leading-tight tracking-[0.08em] text-navy min-[480px]:inline sm:text-[0.88rem] lg:text-[0.95rem]">
            {COMPANY_NAME}
          </span>
        </Link>

        <div className="relative hidden min-w-0 xl:flex xl:h-10 xl:items-center">
          <nav
            className={`flex h-10 w-full items-center justify-center gap-5 xl:gap-6 transition-opacity duration-200 ${
              isSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            aria-label="Primary navigation"
            aria-hidden={isSearchOpen}
          >
            <div
              ref={productsMenuRef}
              className="relative flex h-10 items-center"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={closeProductsMenu}
            >
              <Link
                href="/#categories"
                aria-expanded={isProductsOpen}
                aria-haspopup="menu"
                onClick={(event) => {
                  handleHashLinkClick(event, "/#categories");
                  closeProductsMenu();
                }}
                onFocus={() => setIsProductsOpen(true)}
                className={navLinkClass}
              >
                Products
                <span
                  className={`ml-1 inline-flex size-3 shrink-0 items-center justify-center transition-transform duration-200 ${
                    isProductsOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDownIcon />
                </span>
              </Link>
              <div
                role="menu"
                className={`absolute left-1/2 top-full z-30 w-72 -translate-x-1/2 pt-3 transition-all duration-150 ${
                  isProductsOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible pointer-events-none -translate-y-1 opacity-0"
                }`}
              >
                <div className="max-h-[min(28rem,70vh)] overflow-y-auto rounded-xl border border-border bg-white p-2 shadow-[0_18px_38px_rgba(10,35,66,0.12)]">
                  <Link
                    href="/#categories"
                    role="menuitem"
                    onClick={(event) => {
                      handleHashLinkClick(event, "/#categories");
                    }}
                    className={productsMenuPrimaryClass}
                  >
                    All Products
                  </Link>
                  <div className="mx-2 my-1.5 border-t border-border-light" role="separator" />
                  {catalogCategoryLinks.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/products/${category.slug}`}
                      role="menuitem"
                      onClick={closeProductsMenu}
                      className={productsMenuItemClass}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={navLinkClass}
                onClick={(event) => handleHashLinkClick(event, item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative z-20 flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <CartIconLink />
          <CatalogSearch
            index={searchIndex}
            variant="navbar"
            onOpenChange={(open) => {
              setIsSearchOpen(open);
              if (open) setIsProductsOpen(false);
            }}
          />
          <div className="hidden xl:block">
            <Link
              href="/#inquiry"
              className="btn-primary !px-5 !py-3 text-[0.8125rem]"
              onClick={(event) => handleHashLinkClick(event, "/#inquiry")}
            >
              Request a Quote
              <span className="size-3.5">
                <ArrowUpRightIcon />
              </span>
            </Link>
          </div>
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-sm border border-border text-navy transition-colors hover:border-navy/20 hover:bg-warm-gray focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy xl:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span className="size-5">
              <MenuIcon open={isMenuOpen} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`overflow-hidden border-t border-border-light bg-white transition-[max-height,opacity] duration-300 xl:hidden ${
          isMenuOpen ? "max-h-[min(36rem,75vh)] overflow-y-auto opacity-100" : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8" aria-label="Mobile navigation">
          <Link
            href="/#categories"
            className="block py-3.5 text-sm font-medium text-navy transition-colors hover:text-navy"
            onClick={(event) => {
              handleHashLinkClick(event, "/#categories");
              closeMenu();
            }}
          >
            Products
          </Link>
          <div className="border-t border-border-light" role="separator" />
          {catalogCategoryLinks.map((category) => (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              className="flex items-center justify-between border-b border-border-light py-3 pl-3 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
              onClick={closeMenu}
            >
              {category.name}
            </Link>
          ))}
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between border-b border-border-light py-3.5 text-sm font-medium text-navy-muted last:border-b-0 transition-colors hover:text-navy"
              onClick={(event) => {
                handleHashLinkClick(event, item.href);
                closeMenu();
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="flex items-center justify-between border-b border-border-light py-3.5 text-sm font-medium text-navy-muted transition-colors hover:text-navy"
            onClick={closeMenu}
          >
            Shopping Cart
          </Link>
          <Link
            href="/#inquiry"
            className="btn-primary mt-2 mb-1 w-full"
            onClick={(event) => {
              handleHashLinkClick(event, "/#inquiry");
              closeMenu();
            }}
          >
            Request a Quote
            <span className="size-3.5">
              <ArrowUpRightIcon />
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
