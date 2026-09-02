import type { CartItem } from "./cart";
import { formatCartQuoteItemTextBlock } from "./cart-quote-types";
import { PHONE_WHATSAPP } from "./constants";

export const QUOTE_EMAIL = "sales@mubdisurgicalinstruments.com";
export const QUOTE_EMAIL_SUBJECT = "Quote Request – MUBDI Surgical Instruments";

export type ProductQuoteDetails = {
  productName: string;
  categoryName?: string;
  subcategoryName?: string;
  sizeSpecification?: string;
  quantity?: number;
};

const CART_QUOTE_INTRO = "I would like to request pricing for the following items from my cart:";

function formatQuoteItemBlock(productName: string, sizeSpecification?: string | null, quantity?: number): string {
  const resolvedQuantity = quantity && quantity > 0 ? quantity : 1;
  const sizeLine =
    sizeSpecification && sizeSpecification.length > 0
      ? `Size: ${sizeSpecification}`
      : "Size: Not specified";

  return [productName, sizeLine, `Quantity: ${resolvedQuantity}`].join("\n");
}

function buildQuoteEmailBody(
  itemBlocks: string[],
  intro = "I would like to request a quotation for the following:",
): string {
  return [
    "Hello MUBDI Team,",
    "",
    intro,
    "",
    ...itemBlocks.flatMap((block, index) => (index === 0 ? [block] : ["", block])),
    "",
    "Please provide your best price and availability.",
    "",
    "Thank you.",
  ].join("\n");
}

function buildMailtoLink(subject: string, body: string): string {
  const normalizedBody = body.replace(/\r\n/g, "\n").split("\n").join("\r\n");

  return `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(normalizedBody)}`;
}

/** Opens the system default mail client for a validated mailto link. */
export function openQuoteEmailLink(href: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!href.startsWith(`mailto:${QUOTE_EMAIL}`)) {
    console.error("Invalid quote email link:", href);
    return;
  }

  try {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch (error) {
    console.error("Failed to open quote email client:", error);
    window.location.assign(href);
  }
}

export function buildCartWhatsAppLink(items: CartItem[]): string {
  const itemBlocks = items.map((item) => formatCartQuoteItemTextBlock(item));

  const message = [
    "Hello Mubdi Surgical Instruments,",
    "",
    CART_QUOTE_INTRO,
    "",
    ...itemBlocks.flatMap((block, index) => (index === 0 ? [block] : ["", block])),
    "",
    "Thank you.",
  ].join("\n");

  return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function buildCartEmailLink(items: CartItem[]): string {
  const itemBlocks = items.map((item) => formatCartQuoteItemTextBlock(item));

  return buildMailtoLink(QUOTE_EMAIL_SUBJECT, buildQuoteEmailBody(itemBlocks, CART_QUOTE_INTRO));
}

export function buildProductWhatsAppLink(details: ProductQuoteDetails): string {
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

  return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildProductEmailLink(details: ProductQuoteDetails): string {
  const itemBlock = formatQuoteItemBlock(
    details.productName,
    details.sizeSpecification,
    details.quantity,
  );

  return buildMailtoLink(QUOTE_EMAIL_SUBJECT, buildQuoteEmailBody([itemBlock]));
}

export function buildInquiryEmailLink(details: {
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
  } | null;
}): string {
  if (details.productContext) {
    const itemBlock = formatQuoteItemBlock(details.productContext.productName);
    const body = buildQuoteEmailBody([itemBlock]);
    return buildMailtoLink(QUOTE_EMAIL_SUBJECT, body);
  }

  const lines = [
    "Hello MUBDI Team,",
    "",
    "I would like to request a quotation.",
    "",
  ];

  if (details.inquiryType) {
    lines.push(`Inquiry type: ${details.inquiryType}`, "");
  }

  if (details.name?.trim()) lines.push(`Name: ${details.name.trim()}`);
  if (details.company?.trim()) lines.push(`Company: ${details.company.trim()}`);
  if (details.email?.trim()) lines.push(`Email: ${details.email.trim()}`);
  if (details.country?.trim()) lines.push(`Country: ${details.country.trim()}`);
  if (details.productOfInterest?.trim()) {
    lines.push(`Product of interest: ${details.productOfInterest.trim()}`);
  }
  if (details.message?.trim()) {
    lines.push("", `Message: ${details.message.trim()}`);
  }

  lines.push("", "Please provide your best price and availability.", "", "Thank you.");

  return buildMailtoLink(QUOTE_EMAIL_SUBJECT, lines.join("\n"));
}
