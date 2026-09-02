import type { Metadata } from "next";
import { COMPANY_NAME } from "./constants";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mubdisurgical.com";

type CatalogMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildCatalogMetadata({
  title,
  description,
  path,
  image,
}: CatalogMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image
    ? [{ url: image.startsWith("http") ? image : `${SITE_URL}${image}` }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: COMPANY_NAME,
      title,
      description,
      url,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage?.map((item) => item.url),
    },
  };
}
