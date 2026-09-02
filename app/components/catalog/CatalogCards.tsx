import Link from "next/link";
import type { CatalogProduct, CatalogSubcategory } from "@/app/lib/catalog";
import CatalogVisual from "./CatalogVisual";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SubcategoryCard({
  subcategory,
  categorySlug,
}: {
  subcategory: CatalogSubcategory;
  categorySlug: string;
}) {
  return (
    <article className="surface-card group min-w-0 overflow-hidden">
      <CatalogVisual src={subcategory.image} alt={`${subcategory.name} surgical instruments`} />
      <div className="p-5 sm:p-7">
        <h2 className="text-lg font-bold leading-snug tracking-[-0.025em] text-navy sm:text-xl">{subcategory.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted sm:mt-3 sm:line-clamp-none sm:min-h-12">{subcategory.description}</p>
        <Link href={`/products/${categorySlug}/${subcategory.slug}`} className="text-link mt-5 sm:mt-7">
          Explore Products
          <span className="size-4">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </article>
  );
}

export function ProductCard({
  product,
  categorySlug,
  subcategorySlug,
}: {
  product: CatalogProduct;
  categorySlug: string;
  subcategorySlug: string;
}) {
  return (
    <article className="surface-card group min-w-0 overflow-hidden">
      <CatalogVisual src={product.image} alt={product.name} />
      <div className="p-5 sm:p-6">
        <h2 className="text-base font-bold leading-snug tracking-[-0.02em] text-navy sm:text-lg">{product.name}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted sm:mt-3 sm:line-clamp-none">{product.description}</p>
        <Link
          href={`/products/${categorySlug}/${subcategorySlug}/${product.slug}`}
          className="text-link mt-5 sm:mt-6"
        >
          View product
          <span className="size-4">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </article>
  );
}
