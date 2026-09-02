import type { CartItem } from "./cart";
import type { CartQuoteRequestItem } from "./cart-quote-types";
import { formatCartQuoteItemTextBlock } from "./cart-quote-types";
import { PHONE_WHATSAPP } from "./constants";
import type { ProductQuoteDetails } from "./quote-links";

const CART_QUOTE_INTRO = "I would like to request pricing for the following items from my cart:";

const GENERAL_WHATSAPP_MESSAGE =
  "Hello Mubdi Surgical Instruments,\n\nI am interested in your surgical instruments and would like to discuss your products and custom manufacturing services.\n\nThank you.";

export type InquiryWhatsAppDetails = {
  inquiryType?: string;
  name?: string;
  company?: string;
  email?: string;
  country?: string;
  productOfInterest?: string;
  message?: string;
  productContext?: {
    productName: string;
    categoryName: string;
    subcategoryName: string;
    imageUrl?: string;
  } | null;
};

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsAppMessage(items: Array<CartItem | CartQuoteRequestItem>): string {
  const itemBlocks = items.map((item) => formatCartQuoteItemTextBlock(item));

  return [
    "Hello Mubdi Surgical Instruments,",
    "",
    CART_QUOTE_INTRO,
    "",
    ...itemBlocks.flatMap((block, index) => (index === 0 ? [block] : ["", block])),
    "",
    "Thank you.",
  ].join("\n");
}

export function buildProductWhatsAppMessage(details: ProductQuoteDetails): string {
  const lines = [
    "Hello Mubdi Surgical Instruments,",
    "",
    `I would like to request pricing for: ${details.productName}`,
  ];

  if (details.categoryName && details.subcategoryName) {
    lines.push(`Category: ${details.categoryName} / ${details.subcategoryName}`);
  }

  const trimmedSize = details.sizeSpecification?.trim();
  if (trimmedSize) {
    lines.push(`Size: ${trimmedSize}`);
  }

  if (details.quantity && details.quantity > 0) {
    lines.push(`Quantity: ${details.quantity}`);
  }

  lines.push("", "Thank you.");

  return lines.join("\n");
}

export function buildInquiryWhatsAppMessage(details: InquiryWhatsAppDetails): string {
  if (details.productContext) {
    return [
      "MUBDI SURGICAL INSTRUMENTS — PRODUCT INQUIRY",
      "",
      `Product: ${details.productContext.productName}`,
      `Category: ${details.productContext.categoryName}`,
      `Subcategory: ${details.productContext.subcategoryName}`,
      ...(details.productContext.imageUrl ? [`Product Image: ${details.productContext.imageUrl}`] : []),
      "",
      "Customer details:",
      `Name: ${details.name ?? ""}`,
      `Company: ${details.company ?? ""}`,
      `Email: ${details.email ?? ""}`,
      `Country: ${details.country ?? ""}`,
      `Message: ${details.message ?? ""}`,
    ].join("\n");
  }

  return [
    "Hello Mubdi Surgical Instruments,",
    "",
    "I would like to request a quote.",
    `Inquiry type: ${details.inquiryType ?? ""}`,
    `Name: ${details.name ?? ""}`,
    `Company: ${details.company ?? ""}`,
    `Email: ${details.email ?? ""}`,
    `Country: ${details.country ?? ""}`,
    `Product of interest: ${details.productOfInterest ?? ""}`,
    `Message: ${details.message ?? ""}`,
  ].join("\n");
}

export function buildGeneralWhatsAppMessage(): string {
  return GENERAL_WHATSAPP_MESSAGE;
}
