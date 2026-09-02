import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductDetails from "@/app/components/catalog/CatalogProductDetails";
import JsonLd from "@/app/components/catalog/JsonLd";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import { catalogCategories, getCategory, getSubcategory, withFreshProductImages } from "@/app/lib/catalog";
import { breadcrumbJsonLd, productJsonLd } from "@/app/lib/json-ld";
import { buildCatalogMetadata } from "@/app/lib/seo";

export function generateStaticParams() {
  return catalogCategories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      category: category.slug,
      subcategory: subcategory.slug,
    })),
  );
}

export async function generateMetadata(
  props: PageProps<"/products/[category]/[subcategory]">,
): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await props.params;
  const category = getCategory(categorySlug);
  const subcategory = getSubcategory(categorySlug, subcategorySlug);
  const firstProduct = subcategory?.products[0];

  if (!category || !subcategory || !firstProduct) {
    return { title: "Catalog | Mubdi Surgical Instruments" };
  }

  return buildCatalogMetadata({
    title: `${subcategory.name} | ${category.name} | Mubdi Surgical Instruments`,
    description: subcategory.description,
    path: `/products/${category.slug}/${subcategory.slug}`,
    image: firstProduct.image,
  });
}

/**
 * Subcategory pages host the unified product browser.
 * The first product loads automatically into the existing Product Detail layout.
 */
export default async function SubcategoryPage(
  props: PageProps<"/products/[category]/[subcategory]">,
) {
  const { category: categorySlug, subcategory: subcategorySlug } = await props.params;
  const category = getCategory(categorySlug);
  const subcategoryBase = getSubcategory(categorySlug, subcategorySlug);
  const subcategory = subcategoryBase
    ? withFreshProductImages(categorySlug, subcategoryBase)
    : undefined;
  const firstProduct = subcategory?.products[0];

  if (!category || !subcategory || !firstProduct) {
    notFound();
  }

  const path = `/products/${category.slug}/${subcategory.slug}/${firstProduct.slug}`;

  return (
    <main className="bg-background">
      <JsonLd
        data={[
          productJsonLd({ category, subcategory, product: firstProduct }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: PRODUCTS_HOME_HREF },
            { name: category.name, path: `/products/${category.slug}` },
            { name: subcategory.name, path: `/products/${category.slug}/${subcategory.slug}` },
            { name: firstProduct.name, path },
          ]),
        ]}
      />
      <CatalogProductDetails category={category} subcategory={subcategory} product={firstProduct} />
    </main>
  );
}
