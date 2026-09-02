import { NextResponse } from "next/server";
import type { CartQuoteRequestItem } from "@/app/lib/cart-quote-types";
import type { ProductQuoteDetails } from "@/app/lib/quote-links";
import type { InquiryWhatsAppDetails } from "@/app/lib/whatsapp-quote";
import {
  buildCartWhatsAppMessage,
  buildGeneralWhatsAppMessage,
  buildInquiryWhatsAppMessage,
  buildProductWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/app/lib/whatsapp-quote";

type WhatsAppQuoteRequestBody =
  | { source: "cart"; items: CartQuoteRequestItem[] }
  | { source: "inquiry"; details: InquiryWhatsAppDetails }
  | { source: "product"; details: ProductQuoteDetails }
  | { source: "general" };

function isCartItem(value: unknown): value is CartQuoteRequestItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productName === "string" &&
    typeof item.categoryName === "string" &&
    typeof item.subcategoryName === "string" &&
    typeof item.quantity === "number"
  );
}

function parseBody(body: unknown): WhatsAppQuoteRequestBody | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;

  if (record.source === "general") {
    return { source: "general" };
  }

  if (record.source === "cart" && Array.isArray(record.items) && record.items.length > 0) {
    if (!record.items.every(isCartItem)) return null;
    return { source: "cart", items: record.items };
  }

  if (record.source === "product" && record.details && typeof record.details === "object") {
    const details = record.details as Record<string, unknown>;
    if (typeof details.productName !== "string" || !details.productName.trim()) return null;
    return {
      source: "product",
      details: {
        productName: details.productName,
        categoryName: typeof details.categoryName === "string" ? details.categoryName : undefined,
        subcategoryName:
          typeof details.subcategoryName === "string" ? details.subcategoryName : undefined,
        sizeSpecification:
          typeof details.sizeSpecification === "string" ? details.sizeSpecification : undefined,
        quantity: typeof details.quantity === "number" ? details.quantity : undefined,
      },
    };
  }

  if (record.source === "inquiry" && record.details && typeof record.details === "object") {
    return { source: "inquiry", details: record.details as InquiryWhatsAppDetails };
  }

  return null;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid WhatsApp quote request." }, { status: 400 });
  }

  try {
    const message =
      parsed.source === "cart"
        ? buildCartWhatsAppMessage(parsed.items)
        : parsed.source === "product"
          ? buildProductWhatsAppMessage(parsed.details)
          : parsed.source === "inquiry"
            ? buildInquiryWhatsAppMessage(parsed.details)
            : buildGeneralWhatsAppMessage();

    return NextResponse.json({
      whatsappUrl: buildWhatsAppUrl(message),
    });
  } catch (error) {
    console.error("[whatsapp-quote] Failed to create WhatsApp quote request:", error);
    return NextResponse.json(
      { error: "We could not prepare your WhatsApp quote request right now." },
      { status: 500 },
    );
  }
}
