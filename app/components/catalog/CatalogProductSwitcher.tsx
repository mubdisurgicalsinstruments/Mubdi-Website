"use client";

type ProductOption = {
  slug: string;
  name: string;
};

export default function CatalogProductSwitcher({
  products,
  currentSlug,
  basePath,
  onSelect,
}: {
  products: ProductOption[];
  currentSlug: string;
  basePath: string;
  onSelect?: (slug: string) => void;
}) {
  return (
    <div className="xl:hidden">
      <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-navy">
        Switch product
      </p>
      <label htmlFor="product-switcher" className="sr-only">
        Switch product
      </label>
      <select
        id="product-switcher"
        value={currentSlug}
        onChange={(event) => {
          const nextSlug = event.target.value;
          if (onSelect) {
            onSelect(nextSlug);
            return;
          }
          window.location.assign(`${basePath}/${nextSlug}`);
        }}
        className="h-11 min-h-11 w-full min-w-0 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
      >
        {products.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
