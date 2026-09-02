"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useEffectEvent, useState } from "react";
import CatalogBreadcrumb from "@/app/components/catalog/CatalogBreadcrumb";
import CatalogProductGallery from "@/app/components/catalog/CatalogProductGallery";
import CatalogProductSwitcher from "@/app/components/catalog/CatalogProductSwitcher";
import AddToCartPanel from "@/app/components/cart/AddToCartPanel";
import ReturnsWarranty from "@/app/components/catalog/ReturnsWarranty";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import type { CatalogCategory, CatalogProduct, CatalogSubcategory } from "@/app/lib/catalog";

type CatalogProductDetailsProps = {
  category: CatalogCategory;
  subcategory: CatalogSubcategory;
  product: CatalogProduct;
};

export default function CatalogProductDetails({
  category,
  subcategory,
  product,
}: CatalogProductDetailsProps) {
  const router = useRouter();
  const basePath = `/products/${category.slug}/${subcategory.slug}`;
  const [activeSlug, setActiveSlug] = useState(product.slug);

  const syncFromServer = useEffectEvent((slug: string) => {
    setActiveSlug(slug);
  });

  useEffect(() => {
    syncFromServer(product.slug);
  }, [product.slug]);

  useEffect(() => {
    for (const item of subcategory.products) {
      router.prefetch(`${basePath}/${item.slug}`);
    }
  }, [basePath, router, subcategory.products]);

  const activeProduct =
    subcategory.products.find((item) => item.slug === activeSlug) ?? product;
  const galleryImages = activeProduct.gallery;

  function selectProduct(slug: string) {
    if (slug === activeSlug) return;

    const nextProduct = subcategory.products.find((item) => item.slug === slug);
    if (!nextProduct) return;

    setActiveSlug(slug);
    document.title = `${nextProduct.name} | ${category.name} | Mubdi Surgical Instruments`;

    startTransition(() => {
      router.push(`${basePath}/${slug}`, { scroll: false });
    });
  }

  return (
    <section className="mx-auto max-w-7xl overflow-x-clip px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 xl:px-10">
      <CatalogBreadcrumb
        items={[
          { label: "Products", href: PRODUCTS_HOME_HREF },
          { label: category.name, href: `/products/${category.slug}` },
          { label: subcategory.name, href: basePath },
          { label: activeProduct.name },
        ]}
      />

      <div className="mt-3 xl:hidden">
        <CatalogProductSwitcher
          products={subcategory.products.map((item) => ({ slug: item.slug, name: item.name }))}
          currentSlug={activeProduct.slug}
          basePath={basePath}
          onSelect={selectProduct}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:gap-5 xl:mt-5 xl:grid-cols-[minmax(10.5rem,0.46fr)_minmax(0,1.54fr)] xl:items-start xl:gap-6 2xl:gap-8">
        <aside className="hidden min-w-0 xl:sticky xl:top-28 xl:block xl:self-start">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-navy">
            {subcategory.name}
          </p>
          <nav className="mt-3 border-l border-border" aria-label={`${subcategory.name} products`}>
            {subcategory.products.map((item, index) => {
              const isCurrent = item.slug === activeProduct.slug;

              return (
                <Link
                  key={item.slug}
                  href={`${basePath}/${item.slug}`}
                  scroll={false}
                  prefetch
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                      return;
                    }
                    event.preventDefault();
                    selectProduct(item.slug);
                  }}
                  className={`flex items-center gap-3 border-b border-border-light py-2 pl-4 text-sm font-semibold last:border-b-0 transition-colors ${
                    isCurrent ? "text-navy" : "text-muted hover:text-navy"
                  }`}
                >
                  <span
                    className={`shrink-0 text-[0.65rem] font-bold tracking-[0.14em] ${
                      isCurrent ? "text-navy" : "text-muted-light"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 leading-snug">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div
          key={activeProduct.slug}
          className="min-w-0 grid grid-cols-1 gap-4 animate-[product-soft-fade_200ms_ease-out] md:gap-5 lg:grid-cols-[minmax(0,1.42fr)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-7 motion-reduce:animate-none"
        >
          <div className="min-w-0 w-full">
            <CatalogProductGallery
              key={activeProduct.slug}
              heroImage={galleryImages.hero}
              productName={activeProduct.name}
            />
          </div>

          <div className="flex min-w-0 w-full flex-col">
            <p className="section-label">
              <span className="section-label-rule" />
              {category.name}
            </p>
            <h1 className="section-heading mt-1.5 break-words text-[1.625rem] leading-[1.12] sm:text-[1.75rem] md:text-[1.875rem] lg:text-[2rem] lg:leading-[1.1] xl:text-[37px] xl:leading-[1.1]">
              {activeProduct.name}
            </h1>

            <div className="mt-2.5 min-w-0 overflow-hidden rounded-xl border border-border text-sm">
              <dl className="flex flex-col divide-y divide-border">
                <div className="grid grid-cols-1 gap-0.5 px-3 py-2 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                  <dt className="font-semibold text-navy">Available sizes</dt>
                  <dd className="text-muted">{activeProduct.availableSizes}</dd>
                </div>
                <div className="grid grid-cols-1 gap-0.5 px-3 py-2 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                  <dt className="font-semibold text-navy">Quality</dt>
                  <dd className="text-muted">{activeProduct.material}</dd>
                </div>
                <div className="grid grid-cols-1 gap-0.5 px-3 py-2 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                  <dt className="font-semibold text-navy">Custom Manufacturing</dt>
                  <dd className="text-muted">Available</dd>
                </div>
                <div className="grid grid-cols-1 gap-0.5 px-3 py-2 sm:grid-cols-[8.5rem_1fr] sm:gap-3">
                  <dt className="font-semibold text-navy">Origin</dt>
                  <dd className="text-muted">{activeProduct.finish}</dd>
                </div>
              </dl>

              <AddToCartPanel
                key={activeProduct.slug}
                category={category}
                subcategory={subcategory}
                product={activeProduct}
              />
              <ReturnsWarranty />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
