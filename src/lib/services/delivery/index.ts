/**
 * Delivery abstraction.
 *
 * Customers see "Carguvi Delivery" — the provider behind it is replaceable
 * (local courier, InDrive-style drivers, FedEx, etc.). The mock local
 * provider prices by distance within a configurable operating radius.
 */

export interface DeliveryQuote {
  provider: string;
  fee: number;
  currency: string;
  distanceKm: number | null;
  etaMinutes: number | null;
  serviceable: boolean;
}

export interface DeliveryProvider {
  readonly name: string;
  quote(input: {
    originLat?: number | null;
    originLng?: number | null;
    destLat?: number | null;
    destLng?: number | null;
  }): Promise<DeliveryQuote>;
}

interface DeliverySettings {
  radius_km: number;
  base_fee_usd: number;
  per_km_usd: number;
}

const DEFAULTS: DeliverySettings = {
  radius_km: 40,
  base_fee_usd: 3,
  per_km_usd: 0.5,
};

function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

class LocalDeliveryProvider implements DeliveryProvider {
  readonly name = "carguvi_local";
  constructor(private settings: DeliverySettings) {}

  async quote(input: {
    originLat?: number | null;
    originLng?: number | null;
    destLat?: number | null;
    destLng?: number | null;
  }): Promise<DeliveryQuote> {
    const { originLat, originLng, destLat, destLng } = input;
    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      // Flat city rate when we can't compute distance.
      return {
        provider: this.name,
        fee: this.settings.base_fee_usd + 5 * this.settings.per_km_usd,
        currency: "USD",
        distanceKm: null,
        etaMinutes: 90,
        serviceable: true,
      };
    }
    const km = haversineKm(originLat, originLng, destLat, destLng);
    const serviceable = km <= this.settings.radius_km;
    return {
      provider: this.name,
      fee: serviceable
        ? Math.round((this.settings.base_fee_usd + km * this.settings.per_km_usd) * 100) / 100
        : 0,
      currency: "USD",
      distanceKm: Math.round(km * 10) / 10,
      etaMinutes: Math.max(45, Math.round(30 + km * 3)),
      serviceable,
    };
  }
}

export function getDeliveryProvider(settings?: Partial<DeliverySettings>): DeliveryProvider {
  const merged = { ...DEFAULTS, ...(settings ?? {}) };
  return new LocalDeliveryProvider(merged);
}
