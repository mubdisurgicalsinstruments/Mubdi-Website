"use client";

type WhatsAppQuoteApiResponse = {
  whatsappUrl?: string;
  error?: string;
};

export async function requestWhatsAppQuote(body: unknown): Promise<WhatsAppQuoteApiResponse> {
  const response = await fetch("/api/whatsapp-quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as WhatsAppQuoteApiResponse;

  if (!response.ok) {
    throw new Error(result.error || "We could not prepare your WhatsApp quote request.");
  }

  if (!result.whatsappUrl) {
    throw new Error("We could not prepare your WhatsApp quote request.");
  }

  return result;
}

export function openWhatsAppQuoteUrl(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}
