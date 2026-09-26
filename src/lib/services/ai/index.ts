/**
 * AI service abstraction.
 *
 * AIProvider is the contract; GroqProvider is the first implementation.
 * FallbackProvider provides deterministic behaviour when no API key is
 * configured, so the app is fully functional without external credentials.
 *
 * IMPORTANT: AI is advisory infrastructure. It assists with search
 * interpretation, reminders and listing quality — it never decides
 * inventory truth. Stock state only changes via vendor action, order
 * transactions, or Carguvi verification.
 */

export interface SearchInterpretation {
  keywords: string[];
  make?: string;
  model?: string;
  generation?: string;
  engine?: string;
  fuel?: string;
  year?: number;
  categoryGuess?: string;
}

export interface AIProvider {
  readonly name: string;
  interpretSearch(query: string): Promise<SearchInterpretation>;
  generateReminderCopy(input: {
    vendorName: string;
    listings: { title: string; daysStale: number }[];
  }): Promise<string>;
  suggestListingTitle(input: {
    description: string;
    make?: string;
    model?: string;
    category?: string;
  }): Promise<string>;
}

const SYSTEM_NL_SEARCH = `You interpret vehicle-parts search queries for a Zimbabwean marketplace.
Return ONLY JSON: {"keywords": string[], "make"?: string, "model"?: string,
"generation"?: string, "engine"?: string, "fuel"?: string, "year"?: number,
"categoryGuess"?: string}.
Recognise local phrasing: "new shape"/"old shape" are generation names,
"D4D" implies diesel Toyota engines, "Runx" is a Corolla shape.`;

class GroqProvider implements AIProvider {
  readonly name = "groq";
  constructor(
    private apiKey: string,
    private model: string,
  ) {}

  private async chat(system: string, user: string): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`Groq error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  async interpretSearch(query: string): Promise<SearchInterpretation> {
    const raw = await this.chat(SYSTEM_NL_SEARCH, query);
    try {
      return JSON.parse(raw) as SearchInterpretation;
    } catch {
      return { keywords: query.split(/\s+/) };
    }
  }

  async generateReminderCopy(input: {
    vendorName: string;
    listings: { title: string; daysStale: number }[];
  }): Promise<string> {
    try {
      const raw = await this.chat(
        `Write a short, friendly WhatsApp-style reminder from Carguvi to a parts vendor asking them to confirm stale listings. Return JSON {"text": string}. Max 3 sentences, plain text.`,
        JSON.stringify(input),
      );
      const parsed = JSON.parse(raw);
      return parsed.text ?? fallbackReminder(input);
    } catch {
      return fallbackReminder(input);
    }
  }

  async suggestListingTitle(input: {
    description: string;
    make?: string;
    model?: string;
    category?: string;
  }): Promise<string> {
    try {
      const raw = await this.chat(
        `Generate a concise marketplace listing title for a vehicle part. Format: Make Model Part (Spec). Return JSON {"title": string}.`,
        JSON.stringify(input),
      );
      return JSON.parse(raw).title ?? input.description.slice(0, 80);
    } catch {
      return input.description.slice(0, 80);
    }
  }
}

function fallbackReminder(input: {
  vendorName: string;
  listings: { title: string; daysStale: number }[];
}): string {
  const list = input.listings
    .map((l) => l.title)
    .slice(0, 3)
    .join(", ");
  return `Hi ${input.vendorName} — ${input.listings.length} listing(s) need confirmation. Customers are searching for: ${list}. Are they still available?`;
}

/** Deterministic heuristic interpretation when no AI key is configured. */
class FallbackProvider implements AIProvider {
  readonly name = "fallback";
  async interpretSearch(query: string): Promise<SearchInterpretation> {
    const lower = query.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    const fuel = lower.includes("petrol")
      ? "petrol"
      : lower.includes("diesel") || lower.includes("d4d")
        ? "diesel"
        : undefined;
    const year = words
      .map((w) => parseInt(w, 10))
      .find((n) => n >= 1980 && n <= new Date().getFullYear());
    return {
      keywords: words.filter(
        (w) => !["the", "a", "an", "for", "my", "i", "need", "want"].includes(w),
      ),
      fuel,
      year,
      generation: lower.includes("new shape")
        ? "new shape"
        : lower.includes("old shape")
          ? "old shape"
          : undefined,
    };
  }
  async generateReminderCopy(input: {
    vendorName: string;
    listings: { title: string; daysStale: number }[];
  }): Promise<string> {
    return fallbackReminder(input);
  }
  async suggestListingTitle(input: {
    description: string;
    make?: string;
    model?: string;
    category?: string;
  }): Promise<string> {
    return [input.make, input.model, input.description]
      .filter(Boolean)
      .join(" ")
      .slice(0, 80);
  }
}

let provider: AIProvider | null = null;
export function getAIProvider(): AIProvider {
  if (provider) return provider;
  const key = process.env.GROQ_API_KEY;
  provider = key
    ? new GroqProvider(key, process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile")
    : new FallbackProvider();
  return provider;
}
