import type { CartQuoteRequestPayload } from "./cart-quote-types";
import { formatCartQuoteItemText } from "./cart-quote-types";
import { sendTransactionalQuoteEmail } from "./quote-email-sender";

const QUOTE_EMAIL_SUBJECT = "New Quote Request – Mubdi Surgical Instruments";

const FIELD_LIMITS = {
  fullName: 120,
  companyName: 120,
  email: 254,
  phone: 40,
  country: 80,
  message: 2000,
  productName: 200,
  categoryName: 120,
  subcategoryName: 120,
  sizeSpecification: 100,
  maxItems: 50,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDisplayValue(value: string | null | undefined, fallback = "Not provided"): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export type CartQuoteValidationResult =
  | { ok: true; data: CartQuoteRequestPayload }
  | { ok: false; error: string };

export function validateCartQuoteRequest(body: unknown): CartQuoteValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }

  const record = body as Record<string, unknown>;
  const fullName = trimField(record.fullName, FIELD_LIMITS.fullName);
  const companyName = trimField(record.companyName, FIELD_LIMITS.companyName);
  const email = trimField(record.email, FIELD_LIMITS.email).toLowerCase();
  const phone = trimField(record.phone, FIELD_LIMITS.phone);
  const country = trimField(record.country, FIELD_LIMITS.country);
  const message = trimField(record.message, FIELD_LIMITS.message);

  if (!fullName) return { ok: false, error: "Full name is required." };
  if (!companyName) return { ok: false, error: "Company name is required." };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (!country) return { ok: false, error: "Country is required." };
  if (!phone) return { ok: false, error: "Phone / WhatsApp is required." };

  if (!Array.isArray(record.items) || record.items.length === 0) {
    return { ok: false, error: "At least one cart item is required." };
  }

  if (record.items.length > FIELD_LIMITS.maxItems) {
    return { ok: false, error: "Too many items in this quote request." };
  }

  const items = [];
  for (const item of record.items) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Invalid cart item data." };
    }

    const entry = item as Record<string, unknown>;
    const productName = trimField(entry.productName, FIELD_LIMITS.productName);
    const categoryName = trimField(entry.categoryName, FIELD_LIMITS.categoryName);
    const subcategoryName = trimField(entry.subcategoryName, FIELD_LIMITS.subcategoryName);
    const sizeRaw = trimField(entry.sizeSpecification, FIELD_LIMITS.sizeSpecification);
    const quantity = Number(entry.quantity);

    if (!productName || !categoryName || !subcategoryName) {
      return { ok: false, error: "Each cart item must include product and category details." };
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      return { ok: false, error: "Each cart item must include a valid quantity." };
    }

    items.push({
      productName,
      categoryName,
      subcategoryName,
      sizeSpecification: sizeRaw || null,
      quantity,
    });
  }

  return {
    ok: true,
    data: {
      fullName,
      companyName,
      email,
      phone,
      country,
      message: message || undefined,
      items,
    },
  };
}

export function buildCartQuoteEmailContent(data: CartQuoteRequestPayload, submittedAt: Date) {
  const submittedLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(submittedAt);

  const productLines = data.items.map((item) => formatCartQuoteItemText(item));

  const text = [
    "NEW QUOTE REQUEST",
    "Mubdi Surgical Instruments",
    "",
    "Request Date/Time",
    submittedLabel,
    "",
    "CUSTOMER DETAILS",
    `Full Name: ${data.fullName}`,
    `Company Name: ${data.companyName}`,
    `Email: ${data.email}`,
    `Phone / WhatsApp: ${data.phone}`,
    `Country: ${data.country}`,
    "",
    "REQUESTED PRODUCTS",
    ...productLines.flatMap((block, index) => (index === 0 ? [block] : ["", block])),
    "",
    "ADDITIONAL REQUIREMENTS",
    formatDisplayValue(data.message, "None provided"),
    "",
    "---",
    "This quote request was submitted from the MUBDI website shopping cart.",
  ].join("\n");

  const productRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border:1px solid #d7e0ea;vertical-align:top;">${escapeHtml(item.productName)}</td>
        <td style="padding:12px;border:1px solid #d7e0ea;vertical-align:top;">${escapeHtml(item.categoryName)}</td>
        <td style="padding:12px;border:1px solid #d7e0ea;vertical-align:top;">${escapeHtml(item.subcategoryName)}</td>
        <td style="padding:12px;border:1px solid #d7e0ea;vertical-align:top;">${escapeHtml(formatDisplayValue(item.sizeSpecification, "Not specified"))}</td>
        <td style="padding:12px;border:1px solid #d7e0ea;vertical-align:top;">${item.quantity}</td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0a2342;line-height:1.6;max-width:720px;">
      <h1 style="margin:0 0 8px;font-size:24px;color:#0a2342;">New Quote Request</h1>
      <p style="margin:0 0 24px;color:#4a6078;">Mubdi Surgical Instruments</p>
      <p style="margin:0 0 24px;"><strong>Request Date/Time:</strong> ${escapeHtml(submittedLabel)}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Customer Details</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr><td style="padding:8px 0;width:180px;color:#4a6078;">Full Name</td><td style="padding:8px 0;">${escapeHtml(data.fullName)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Company Name</td><td style="padding:8px 0;">${escapeHtml(data.companyName)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Email</td><td style="padding:8px 0;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Phone / WhatsApp</td><td style="padding:8px 0;">${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Country</td><td style="padding:8px 0;">${escapeHtml(data.country)}</td></tr>
      </table>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Requested Products</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;font-size:14px;">
        <thead>
          <tr>
            <th align="left" style="padding:12px;border:1px solid #d7e0ea;background:#f7f7f7;">Product</th>
            <th align="left" style="padding:12px;border:1px solid #d7e0ea;background:#f7f7f7;">Category</th>
            <th align="left" style="padding:12px;border:1px solid #d7e0ea;background:#f7f7f7;">Subcategory</th>
            <th align="left" style="padding:12px;border:1px solid #d7e0ea;background:#f7f7f7;">Size/Detail</th>
            <th align="left" style="padding:12px;border:1px solid #d7e0ea;background:#f7f7f7;">Qty</th>
          </tr>
        </thead>
        <tbody>${productRows}</tbody>
      </table>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Additional Requirements</h2>
      <p style="margin:0 0 24px;white-space:pre-wrap;">${escapeHtml(formatDisplayValue(data.message, "None provided"))}</p>

      <p style="margin:0;color:#6a7f96;font-size:12px;">Submitted from the MUBDI website shopping cart.</p>
    </div>
  `;

  return { subject: QUOTE_EMAIL_SUBJECT, text, html };
}

export async function sendCartQuoteEmail(data: CartQuoteRequestPayload): Promise<void> {
  const submittedAt = new Date();
  const { subject, text, html } = buildCartQuoteEmailContent(data, submittedAt);

  await sendTransactionalQuoteEmail({
    replyTo: data.email,
    subject,
    text,
    html,
  });
}
