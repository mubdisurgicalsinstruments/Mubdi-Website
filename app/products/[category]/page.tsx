import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogBreadcrumb from "@/app/components/catalog/CatalogBreadcrumb";
import CatalogInquiry from "@/app/components/catalog/CatalogInquiry";
import CatalogNavigator from "@/app/components/catalog/CatalogNavigator";
import JsonLd from "@/app/components/catalog/JsonLd";
import { PRODUCTS_HOME_HREF } from "@/app/lib/catalog-nav";
import { catalogCategories, getCategory, withFreshCategoryImages } from "@/app/lib/catalog";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/app/lib/json-ld";
import { buildCatalogMetadata } from "@/app/lib/seo";

export function generateStaticParams() {
  return catalogCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[category]">,
): Promise<Metadata> {
  const { category: categorySlug } = await props.params;
  const category = getCategory(categorySlug);

  if (!category) {
    return { title: "Catalog | Mubdi Surgical Instruments" };
  }

  return buildCatalogMetadata({
    title: `${category.name} | Mubdi Surgical Instruments`,
    description: category.description,
    path: `/products/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryPage(props: PageProps<"/products/[category]">) {
  const { category: categorySlug } = await props.params;
  const categoryBase = getCategory(categorySlug);
  const category = categoryBase ? withFreshCategoryImages(categoryBase) : undefined;

  if (!category) {
    notFound();
  }

  const path = `/products/${category.slug}`;

  return (
    <main className="bg-background">
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: category.name,
            description: category.description,
            path,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Products", path: PRODUCTS_HOME_HREF },
            { name: category.name, path },
          ]),
        ]}
      />

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8 sm:py-7 lg:px-10">
          <CatalogBreadcrumb
            items={[
              { label: "Products", href: PRODUCTS_HOME_HREF },
              { label: category.name },
            ]}
          />
          <p className="section-label mt-2 sm:mt-3">
            <span className="section-label-rule" />
            Product category
          </p>
          <h1 className="section-heading mt-1.5 text-[1.75rem] leading-[1.15] sm:mt-2 sm:text-5xl sm:leading-[1.12]">{category.name}</h1>
          <p className="body-copy mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed sm:mt-2 sm:text-base sm:leading-[1.75] lg:text-[1.05rem]">{category.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-10 lg:px-10">
        <CatalogNavigator
          label={category.name}
          actionLabel="Explore Products"
          items={category.subcategories.map((subcategory) => ({
            name: subcategory.name,
            description: subcategory.description,
            image: subcategory.image,
            href: `/products/${category.slug}/${subcategory.slug}`,
          }))}
        />
        <CatalogInquiry />
      </section>
    </main>
  );
}
