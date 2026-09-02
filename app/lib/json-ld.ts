import type { CatalogCategory, CatalogProduct, CatalogSubcategory } from "./catalog";
import { COMPANY_NAME } from "./constants";
import { SITE_URL } from "./seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_NAME,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sialkot",
      addressCountry: "PK",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: COMPANY_NAME,
    url: SITE_URL,
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: COMPANY_NAME,
      url: SITE_URL,
    },
  };
}

export function productJsonLd(input: {
  category: CatalogCategory;
  subcategory: CatalogSubcategory;
  product: CatalogProduct;
}) {
  const path = `/products/${input.category.slug}/${input.subcategory.slug}/${input.product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.product.name,
    description: input.product.description,
    image: [`${SITE_URL}${input.product.image}`],
    brand: {
      "@type": "Brand",
      name: COMPANY_NAME,
    },
    category: `${input.category.name} > ${input.subcategory.name}`,
    material: input.product.material,
    url: `${SITE_URL}${path}`,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}${path}`,
      seller: {
        "@type": "Organization",
        name: COMPANY_NAME,
      },
    },
  };
}
