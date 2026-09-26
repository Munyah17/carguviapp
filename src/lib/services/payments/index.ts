/**
 * Payment abstraction.
 *
 * Carguvi never hard-codes a provider. `getPaymentProvider()` resolves the
 * configured provider; the mock provider is used in local/demo environments
 * until real rails (Paynow, EcoCash, ZIPIT) are configured.
 */

export interface PaymentIntent {
  provider: string;
  method: string;
  amount: number;
  currency: string;
  reference: string;
}

export interface PaymentResult {
  status: "confirmed" | "pending" | "failed";
  reference: string;
  raw?: unknown;
}

export interface PaymentProvider {
  readonly name: string;
  initiate(intent: PaymentIntent): Promise<PaymentResult>;
  verify(reference: string): Promise<PaymentResult>;
  refund(reference: string, amount: number): Promise<PaymentResult>;
}

/** Demo provider — instant "confirmed". Replace with Paynow/EcoCash adapters. */
class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";
  async initiate(intent: PaymentIntent): Promise<PaymentResult> {
    return {
      status: "confirmed",
      reference: `MOCK-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      raw: { intent, simulated: true },
    };
  }
  async verify(reference: string): Promise<PaymentResult> {
    return { status: "confirmed", reference };
  }
  async refund(reference: string): Promise<PaymentResult> {
    return { status: "confirmed", reference };
  }
}

// Future providers implement PaymentProvider and register here.
const providers: Record<string, PaymentProvider> = {
  mock: new MockPaymentProvider(),
};

export function getPaymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  return providers[name] ?? providers.mock;
}
