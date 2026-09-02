import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogProductDetails from "@/app/components/catalog/CatalogProductDetails";
import JsonLd from "@/app/components/catalog/JsonLd";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import { catalogCategories, getCategory, getProduct, getSubcategory, withFreshProductImages } from "@/app/lib/catalog";
import { breadcrumbJsonLd, productJsonLd } from "@/app/lib/json-ld";
import { buildCatalogMetadata } from "@/app/lib/seo";

export function generateStaticParams() {
  return catalogCategories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.products.map((product) => ({
        category: category.slug,
        subcategory: subcategory.slug,
        product: product.slug,
      })),
    ),
  );
}

export async function generateMetadata(
  props: PageProps<"/products/[category]/[subcategory]/[product]">,
): Promise<Metadata> {
  const {
    category: categorySlug,
    subcategory: subcategorySlug,
    product: productSlug,
  } = await props.params;
  const category = getCategory(categorySlug);
  const product = getProduct(categorySlug, subcategorySlug, productSlug);

  if (!category || !product) {
    return { title: "Product | Mubdi Surgical Instruments" };
  }

  return buildCatalogMetadata({
    title: `${product.name} | ${category.name} | Mubdi Surgical Instruments`,
    description: product.description,
    path: `/products/${category.slug}/${subcategorySlug}/${product.slug}`,
    image: product.image,
  });
}

/**
 * Product URLs stay for SEO and sharing. They render the same subcategory
 * product browser (not a separate detail experience).
 */
export default async function ProductPage(
  props: PageProps<"/products/[category]/[subcategory]/[product]">,
) {
  const {
    category: categorySlug,
    subcategory: subcategorySlug,
    product: productSlug,
  } = await props.params;

  const category = getCategory(categorySlug);
  const subcategoryBase = getSubcategory(categorySlug, subcategorySlug);
  const subcategory = subcategoryBase
    ? withFreshProductImages(categorySlug, subcategoryBase)
    : undefined;
  const product = subcategory?.products.find((item) => item.slug === productSlug);

  if (!category || !subcategory || !product) {
    notFound();
  }

  const path = `/products/${category.slug}/${subcategory.slug}/${product.slug}`;

  return (
    <main className="bg-background">
      <JsonLd
        data={[
          productJsonLd({ category, subcategory, product }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: PRODUCTS_HOME_HREF },
            { name: category.name, path: `/products/${category.slug}` },
            { name: subcategory.name, path: `/products/${category.slug}/${subcategory.slug}` },
            { name: product.name, path },
          ]),
        ]}
      />
      <CatalogProductDetails category={category} subcategory={subcategory} product={product} />
    </main>
  );
}
