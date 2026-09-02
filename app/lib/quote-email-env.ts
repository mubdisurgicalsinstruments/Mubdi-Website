import { COMPANY_NAME, EMAIL } from "./constants";

export type QuoteEmailConfig = {
  apiKey: string;
  from: string;
  to: string;
};

/** Canonical Resend From for all website quote emails. */
export const QUOTE_EMAIL_SENDER = `${COMPANY_NAME} <${EMAIL}>`;

const DEFAULT_QUOTE_EMAIL_FROM = QUOTE_EMAIL_SENDER;

export function resolveQuoteEmailConfig(): QuoteEmailConfig {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Set it in your hosting environment variables (see .env.example).",
    );
  }

  const from = process.env.QUOTE_EMAIL_FROM?.trim() || DEFAULT_QUOTE_EMAIL_FROM;
  const to = process.env.QUOTE_EMAIL_TO?.trim() || EMAIL;

  return { apiKey, from, to };
}

export function logQuoteEmailFailure(source: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${source}] Quote email delivery failed: ${message}`);

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }

  const to = process.env.QUOTE_EMAIL_TO?.trim() || EMAIL;

  console.error(
    `[${source}] Check .env.local:\n` +
      `  RESEND_API_KEY=re_... (https://resend.com/api-keys)\n` +
      `  QUOTE_EMAIL_FROM=${QUOTE_EMAIL_SENDER}\n` +
      `  QUOTE_EMAIL_TO=${to}\n` +
      "Resend requires a verified domain and API key in .env.local.",
  );
}
