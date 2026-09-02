import { NextResponse } from "next/server";
import { sendCartQuoteEmail, validateCartQuoteRequest } from "@/app/lib/cart-quote-email";
import { logQuoteEmailFailure } from "@/app/lib/quote-email-sender";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateCartQuoteRequest(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    await sendCartQuoteEmail(validation.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    logQuoteEmailFailure("cart-quote", error);
    return NextResponse.json(
      {
        error:
          "We could not send your quote request right now. Please try again shortly or contact us directly at sales@mubdisurgicalinstruments.com.",
      },
      { status: 500 },
    );
  }
}
