import type { CatalogProduct } from "./catalog";

const GENERIC_SIZE_PHRASES = [
  /^multiple sizes available$/i,
  /^various sizes$/i,
  /^sizes? available$/i,
  /^contact (us )?for sizes?$/i,
  /^one size$/i,
  /^standard$/i,
];

function isGenericSizeLabel(value: string) {
  const trimmed = value.trim();
  return GENERIC_SIZE_PHRASES.some((pattern) => pattern.test(trimmed));
}

/**
 * Parses explicit size lists from an `availableSizes` display string.
 * Returns an empty array for generic labels or a single size.
 */
export function parseProductSizes(availableSizes: string): string[] {
  const trimmed = availableSizes.trim();
  if (!trimmed || isGenericSizeLabel(trimmed)) {
    return [];
  }

  const parts = trimmed
    .split(/[,;/]|(?:\s+\/\s+)/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return [];
  }

  return parts;
}

/** Returns selectable size options when a product has multiple configured sizes. */
export function getProductSizeOptions(product: Pick<CatalogProduct, "availableSizes" | "sizeOptions">): string[] {
  if (product.sizeOptions && product.sizeOptions.length >= 2) {
    return product.sizeOptions;
  }

  return parseProductSizes(product.availableSizes);
}

export function productRequiresSizeSelection(
  product: Pick<CatalogProduct, "availableSizes" | "sizeOptions">,
): boolean {
  return getProductSizeOptions(product).length >= 2;
}
