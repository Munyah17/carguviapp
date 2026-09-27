import type {
  PaymentIntent,
  PaymentProvider,
  PaymentResult,
} from "./index";
import { createHash } from "crypto";

/**
 * Paynow (Zimbabwe) provider — real API shape, activated when
 * PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are configured.
 *
 * Paynow flow: POST initiate → receive pollURL + redirectURL → customer pays
 * via EcoCash/Innbucks/OneMoney/card → Paynow calls our result URL and we
 * poll pollURL to confirm.
 */
export class PaynowProvider implements PaymentProvider {
  readonly name = "paynow";

  constructor(
    private integrationId: string,
    private integrationKey: string,
    private resultUrl: string,
    private returnUrl: string,
  ) {}

  private hash(fields: Record<string, string>): string {
    const concat =
      Object.values(fields).join("") + this.integrationKey;
    return createHash("sha512").update(concat).digest("hex").toUpperCase();
  }

  async initiate(intent: PaymentIntent): Promise<PaymentResult> {
    const fields: Record<string, string> = {
      id: this.integrationId,
      reference: intent.reference,
      amount: intent.amount.toFixed(2),
      additionalinfo: `Carguvi order ${intent.reference}`,
      returnurl: this.returnUrl,
      resulturl: this.resultUrl,
      authemail: "",
      status: "Message",
    };
    const hash = this.hash(fields);
    const body = new URLSearchParams({ ...fields, hash });

    const res = await fetch("https://www.paynow.co.zw/interface/initiatetransaction", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const text = await res.text();
    const params = new URLSearchParams(text);
    const status = params.get("status");
    if (status !== "Ok") {
      return {
        status: "failed",
        reference: intent.reference,
        raw: text,
      };
    }
    return {
      status: "pending",
      reference: intent.reference,
      raw: {
        pollUrl: params.get("pollurl"),
        redirectUrl: params.get("browserurl"),
        instructions: params.get("instructions"),
      },
    };
  }

  async verify(reference: string): Promise<PaymentResult> {
    // Paynow gives us a pollUrl at initiation; callers should store it.
    // This path verifies via status endpoint using reference as pollUrl id.
    const res = await fetch(reference.startsWith("http") ? reference : `https://www.paynow.co.zw/interface/remotetransaction?ref=${encodeURIComponent(reference)}`);
    const text = await res.text();
    const params = new URLSearchParams(text);
    const paid = params.get("status")?.toLowerCase() === "paid" || params.get("paid") === "true";
    return {
      status: paid ? "confirmed" : "pending",
      reference,
      raw: text,
    };
  }

  async refund(reference: string): Promise<PaymentResult> {
    // Paynow refunds are manual via the Paynow dashboard for most methods.
    return { status: "pending", reference };
  }
}

export function createPaynowProvider(): PaynowProvider | null {
  const id = process.env.PAYNOW_INTEGRATION_ID;
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "https://carguviapp.vercel.app";
  if (!id || !key) return null;
  return new PaynowProvider(
    id,
    key,
    `${base}/api/webhooks/paynow`,
    `${base}/orders`,
  );
}
