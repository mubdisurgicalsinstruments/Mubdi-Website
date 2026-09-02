import { Resend } from "resend";
import { logQuoteEmailFailure, resolveQuoteEmailConfig } from "./quote-email-env";

export async function sendTransactionalQuoteEmail(options: {
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const { apiKey, from, to } = resolveQuoteEmailConfig();

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: [to],
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  if (result.error) {
    const resendMessage = result.error.message || "Unknown Resend API error.";
    if (process.env.NODE_ENV === "development") {
      console.error("[quote-email] Resend API rejected the send:", JSON.stringify(result.error));
    }
    throw new Error(resendMessage);
  }

  if (!result.data?.id) {
    throw new Error("Resend accepted the request but did not return an email id.");
  }

  if (process.env.NODE_ENV === "development") {
    console.info(`[quote-email] Quote email accepted by Resend (id: ${result.data.id}) → ${to}`);
  }
}

export { logQuoteEmailFailure };
