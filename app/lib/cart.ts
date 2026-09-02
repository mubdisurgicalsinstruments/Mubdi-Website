export type CartItem = {
  id: string;
  productSlug: string;
  productName: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string;
  subcategoryName: string;
  imageUrl: string;
  sizeSpecification: string | null;
  quantity: number;
};

export const CART_STORAGE_KEY = "mubdi-cart";

export const SIZE_SPECIFICATION_MAX_LENGTH = 100;

/** Keeps customer-entered size/detail text within the allowed length. */
export function normalizeSizeSpecificationInput(value: string): string {
  return value.slice(0, SIZE_SPECIFICATION_MAX_LENGTH);
}

/** Returns an error message when size/detail is missing or too long. */
export function validateSizeSpecification(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Please enter a size or short detail.";
  }

  if (trimmed.length > SIZE_SPECIFICATION_MAX_LENGTH) {
    return `Size must be ${SIZE_SPECIFICATION_MAX_LENGTH} characters or fewer.`;
  }

  return null;
}

export function buildCartItemId(
  categorySlug: string,
  subcategorySlug: string,
  productSlug: string,
  sizeSpecification: string | null,
): string {
  return [categorySlug, subcategorySlug, productSlug, sizeSpecification ?? ""].join("::");
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Parses a positive whole-number quantity. Returns null for invalid input. */
export function parsePositiveIntegerQuantity(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
