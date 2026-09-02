import { inquiryTypes, isInquiryTypeSlug } from "./manufacturing-services";
import { sendTransactionalQuoteEmail } from "./quote-email-sender";

const QUOTE_EMAIL_SUBJECT = "New Quote Request – Mubdi Surgical Instruments";

const FIELD_LIMITS = {
  name: 120,
  company: 120,
  email: 254,
  phone: 40,
  country: 80,
  inquiryType: 120,
  productOfInterest: 200,
  message: 4000,
  categoryName: 120,
  subcategoryName: 120,
  imageUrl: 500,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type InquiryQuoteProductContext = {
  productName: string;
  categoryName: string;
  subcategoryName: string;
  imageUrl?: string;
};

export type InquiryQuoteRequestPayload = {
  name: string;
  company?: string;
  email: string;
  phone: string;
  country: string;
  inquiryType: string;
  inquirySlug: string;
  productOfInterest: string;
  message: string;
  productContext?: InquiryQuoteProductContext | null;
};

export type InquiryQuoteValidationResult =
  | { ok: true; data: InquiryQuoteRequestPayload }
  | { ok: false; error: string };

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

function formatSubmittedAt(submittedAt: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(submittedAt);
}

export function validateInquiryQuoteRequest(body: unknown): InquiryQuoteValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request." };
  }

  const record = body as Record<string, unknown>;
  const name = trimField(record.name, FIELD_LIMITS.name);
  const company = trimField(record.company, FIELD_LIMITS.company);
  const email = trimField(record.email, FIELD_LIMITS.email).toLowerCase();
  const phone = trimField(record.phone, FIELD_LIMITS.phone);
  const country = trimField(record.country, FIELD_LIMITS.country);
  const inquirySlug = trimField(record.inquirySlug, 80);
  const inquiryType = trimField(record.inquiryType, FIELD_LIMITS.inquiryType);
  const productOfInterest = trimField(record.productOfInterest, FIELD_LIMITS.productOfInterest);
  const message = trimField(record.message, FIELD_LIMITS.message);

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (!phone) return { ok: false, error: "Phone / WhatsApp is required." };
  if (!country) return { ok: false, error: "Country is required." };
  if (!inquiryType && !inquirySlug) {
    return { ok: false, error: "Inquiry type is required." };
  }
  if (!productOfInterest) return { ok: false, error: "Product of interest is required." };
  if (!message) return { ok: false, error: "Message is required." };

  const resolvedSlug = isInquiryTypeSlug(inquirySlug)
    ? inquirySlug
    : inquiryTypes.find((option) => option.title === inquiryType)?.slug ?? inquirySlug;
  const resolvedType =
    inquiryType ||
    inquiryTypes.find((option) => option.slug === resolvedSlug)?.title ||
    resolvedSlug;

  let productContext: InquiryQuoteProductContext | null = null;
  if (record.productContext && typeof record.productContext === "object") {
    const context = record.productContext as Record<string, unknown>;
    const productName = trimField(context.productName, FIELD_LIMITS.productOfInterest);
    const categoryName = trimField(context.categoryName, FIELD_LIMITS.categoryName);
    const subcategoryName = trimField(context.subcategoryName, FIELD_LIMITS.subcategoryName);
    const imageUrl = trimField(context.imageUrl, FIELD_LIMITS.imageUrl);

    if (productName && categoryName && subcategoryName) {
      productContext = {
        productName,
        categoryName,
        subcategoryName,
        imageUrl: imageUrl || undefined,
      };
    }
  }

  return {
    ok: true,
    data: {
      name,
      company: company || undefined,
      email,
      phone,
      country,
      inquiryType: resolvedType,
      inquirySlug: resolvedSlug || "general-other-inquiry",
      productOfInterest,
      message,
      productContext,
    },
  };
}

export function buildInquiryQuoteEmailContent(data: InquiryQuoteRequestPayload, submittedAt: Date) {
  const submittedLabel = formatSubmittedAt(submittedAt);

  const text = [
    "NEW QUOTE REQUEST",
    "Mubdi Surgical Instruments",
    "",
    "Request Date/Time",
    submittedLabel,
    "",
    "CUSTOMER DETAILS",
    `Name: ${data.name}`,
    `Company: ${formatDisplayValue(data.company, "Not provided")}`,
    `Email: ${data.email}`,
    `Phone / WhatsApp: ${data.phone}`,
    `Country: ${data.country}`,
    "",
    "INQUIRY DETAILS",
    `Inquiry Type: ${data.inquiryType}`,
    `Product of Interest: ${data.productOfInterest}`,
    ...(data.productContext
      ? [
          `Category: ${data.productContext.categoryName}`,
          `Subcategory: ${data.productContext.subcategoryName}`,
          `Product Image: ${formatDisplayValue(data.productContext.imageUrl)}`,
        ]
      : []),
    "",
    "MESSAGE / ADDITIONAL REQUIREMENTS",
    data.message,
    "",
    "---",
    "This quote request was submitted from the MUBDI website Request a Quote form.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0a2342;line-height:1.6;max-width:720px;">
      <h1 style="margin:0 0 8px;font-size:24px;color:#0a2342;">New Quote Request</h1>
      <p style="margin:0 0 24px;color:#4a6078;">Mubdi Surgical Instruments</p>
      <p style="margin:0 0 24px;"><strong>Request Date/Time:</strong> ${escapeHtml(submittedLabel)}</p>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Customer Details</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr><td style="padding:8px 0;width:180px;color:#4a6078;">Name</td><td style="padding:8px 0;">${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Company</td><td style="padding:8px 0;">${escapeHtml(formatDisplayValue(data.company, "Not provided"))}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Email</td><td style="padding:8px 0;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Phone / WhatsApp</td><td style="padding:8px 0;">${escapeHtml(data.phone)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Country</td><td style="padding:8px 0;">${escapeHtml(data.country)}</td></tr>
      </table>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Inquiry Details</h2>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr><td style="padding:8px 0;width:180px;color:#4a6078;">Inquiry Type</td><td style="padding:8px 0;">${escapeHtml(data.inquiryType)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Product of Interest</td><td style="padding:8px 0;">${escapeHtml(data.productOfInterest)}</td></tr>
        ${
          data.productContext
            ? `<tr><td style="padding:8px 0;color:#4a6078;">Category</td><td style="padding:8px 0;">${escapeHtml(data.productContext.categoryName)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Subcategory</td><td style="padding:8px 0;">${escapeHtml(data.productContext.subcategoryName)}</td></tr>
        <tr><td style="padding:8px 0;color:#4a6078;">Product Image</td><td style="padding:8px 0;">${escapeHtml(formatDisplayValue(data.productContext.imageUrl))}</td></tr>`
            : ""
        }
      </table>

      <h2 style="margin:0 0 12px;font-size:18px;color:#0a2342;">Message / Additional Requirements</h2>
      <p style="margin:0 0 24px;white-space:pre-wrap;">${escapeHtml(data.message)}</p>

      <p style="margin:0;color:#6a7f96;font-size:12px;">Submitted from the MUBDI website Request a Quote form.</p>
    </div>
  `;

  return { subject: QUOTE_EMAIL_SUBJECT, text, html };
}

export async function sendInquiryQuoteEmail(data: InquiryQuoteRequestPayload): Promise<void> {
  const { subject, text, html } = buildInquiryQuoteEmailContent(data, new Date());
  await sendTransactionalQuoteEmail({
    replyTo: data.email,
    subject,
    text,
    html,
  });
}
