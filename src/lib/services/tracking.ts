/**
 * GPS tracker integration — vendors bind each fleet vehicle's tracker
 * device ID to a delivery. Live position comes from the configured provider;
 * when TRACKER_PROVIDER is unset (or a poll fails) a mock provider supplies
 * plausible progress and dispatchers can always post manual updates.
 */

export interface TrackerPosition {
  latitude: number;
  longitude: number;
  recorded_at: string; // ISO
}

export interface TrackingProvider {
  name: string;
  /** Latest position for a tracker device, or null when offline/unconfigured. */
  fetchPosition(deviceId: string): Promise<TrackerPosition | null>;
}

// --- Mock provider: deterministic "moving" dot for demo/dev ------------------
const mockProvider: TrackingProvider = {
  name: "mock",
  async fetchPosition(deviceId) {
    // Deterministic drift so repeated polls look like movement around Harare.
    const seed = [...deviceId].reduce((a, c) => a + c.charCodeAt(0), 0);
    const t = Date.now() / 60000; // moves slowly per minute
    return {
      latitude: -17.8292 + Math.sin((seed + t) / 20) * 0.02,
      longitude: 31.0522 + Math.cos((seed + t) / 20) * 0.02,
      recorded_at: new Date().toISOString(),
    };
  },
};

// --- Teltonika-style HTTP provider scaffold ----------------------------------
// Point TRACKER_API_URL at your tracker's HTTP endpoint; expects JSON with
// lat/lng fields. Swap for a real fleet API (Teltonika, Concox, etc.).
const httpProvider: TrackingProvider = {
  name: "http",
  async fetchPosition(deviceId) {
    const base = process.env.TRACKER_API_URL;
    if (!base) return null;
    try {
      const res = await fetch(`${base}?device=${encodeURIComponent(deviceId)}`, {
        headers: process.env.TRACKER_API_KEY
          ? { Authorization: `Bearer ${process.env.TRACKER_API_KEY}` }
          : {},
        next: { revalidate: 0 },
      });
      if (!res.ok) return null;
      const j = await res.json();
      const lat = Number(j.latitude ?? j.lat);
      const lng = Number(j.longitude ?? j.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        latitude: lat,
        longitude: lng,
        recorded_at: j.timestamp ?? new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },
};

export function getTrackingProvider(): TrackingProvider {
  return process.env.TRACKER_API_URL ? httpProvider : mockProvider;
}

/** Generate a short public tracking code, e.g. CGV-8F2K9Q. */
export function makeTrackingCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CGV-${s}`;
}
