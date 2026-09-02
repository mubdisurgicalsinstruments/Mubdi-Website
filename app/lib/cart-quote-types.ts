import type { CartItem } from "./cart";

export type CartQuoteRequestItem = {
  productName: string;
  categoryName: string;
  subcategoryName: string;
  sizeSpecification: string | null;
  quantity: number;
};

export type CartQuoteRequestPayload = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  message?: string;
  items: CartQuoteRequestItem[];
};

export function cartItemsToQuoteItems(items: CartItem[]): CartQuoteRequestItem[] {
  return items.map((item) => ({
    productName: item.productName,
    categoryName: item.categoryName,
    subcategoryName: item.subcategoryName,
    sizeSpecification: item.sizeSpecification,
    quantity: item.quantity,
  }));
}

export function formatCartQuoteItemText(item: CartQuoteRequestItem): string {
  return formatCartQuoteItemTextBlock(item);
}

type CartQuoteItemDetails = Pick<
  CartQuoteRequestItem,
  "productName" | "categoryName" | "subcategoryName" | "sizeSpecification" | "quantity"
>;

function formatCartQuoteItemSizeLine(sizeSpecification: string | null): string {
  if (sizeSpecification === null || sizeSpecification === "") {
    return "Size: Not specified";
  }

  return `Size: ${sizeSpecification}`;
}

export function formatCartQuoteItemTextBlock(
  item: CartQuoteItemDetails,
  options?: { numberedIndex?: number },
): string {
  const productLine =
    options?.numberedIndex !== undefined
      ? `${options.numberedIndex + 1}. ${item.productName}`
      : `- ${item.productName}`;

  return [
    productLine,
    `Category: ${item.categoryName}`,
    `Subcategory: ${item.subcategoryName}`,
    formatCartQuoteItemSizeLine(item.sizeSpecification),
    `Quantity: ${item.quantity}`,
  ].join("\n");
}
