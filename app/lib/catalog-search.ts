export type CatalogSearchHit = {
  type: "category" | "subcategory" | "product";
  name: string;
  href: string;
  breadcrumb: string;
  image: string;
};

export function searchCatalog(
  query: string,
  index: CatalogSearchHit[],
  limit = 24,
): CatalogSearchHit[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  return index
    .map((hit) => {
      const haystack = `${hit.name} ${hit.breadcrumb}`.toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) {
        return { hit, score: 0 };
      }

      let score = 1;
      const name = hit.name.toLowerCase();
      if (name === normalized) score += 5;
      else if (name.startsWith(normalized)) score += 3;
      else if (name.includes(normalized)) score += 2;
      if (hit.type === "product") score += 0.5;
      if (hit.type === "category") score += 0.25;

      return { hit, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.hit.name.localeCompare(b.hit.name))
    .slice(0, limit)
    .map((entry) => entry.hit);
}
