import { PHONE_WHATSAPP } from "./constants";

export function getProductWhatsAppLink(productName: string) {
  const message = `Hello, I'm interested in the ${productName}. Please send me pricing, MOQ, and custom branding options.`;
  return `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
