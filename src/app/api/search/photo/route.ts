import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/services/ai";

/**
 * POST /api/search/photo { dataUrl }
 * Identifies a vehicle part from a customer photo and returns search
 * keywords. Requires a vision-capable AI provider (Groq); returns 503 when
 * unconfigured so the UI can hide the feature.
 */
export async function POST(request: NextRequest) {
  const { dataUrl } = (await request.json().catch(() => ({}))) as {
    dataUrl?: string;
  };
  if (!dataUrl || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "invalid image" }, { status: 400 });
  }
  if (dataUrl.length > 6_000_000) {
    return NextResponse.json({ error: "image too large" }, { status: 413 });
  }

  const ai = getAIProvider();
  const result = await ai.interpretPartPhoto(dataUrl).catch(() => null);
  if (!result) {
    return NextResponse.json(
      { error: "photo search not available" },
      { status: 503 },
    );
  }
  if ((result as any).error === "not_a_part" || !result.keywords?.length) {
    return NextResponse.json(
      { error: "Couldn't identify a vehicle part in this photo" },
      { status: 422 },
    );
  }
  return NextResponse.json({ query: result.keywords.join(" "), interpretation: result });
}
