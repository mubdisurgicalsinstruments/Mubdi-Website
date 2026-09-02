import type { MetadataRoute } from "next";
import { getAllCatalogPaths } from "@/app/lib/catalog";
import { footerPolicyLinks } from "@/app/lib/policy-pages";
import { SITE_URL } from "@/app/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const catalogEntries = getAllCatalogPaths().map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path.split("/").length <= 3 ? 0.8 : 0.6,
  }));

  const policyEntries = footerPolicyLinks.map((item) => ({
    url: `${SITE_URL}${item.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...policyEntries,
    ...catalogEntries,
  ];
}
