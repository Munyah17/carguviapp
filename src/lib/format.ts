export function formatPrice(amount: number | string, currency = "USD"): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${n.toLocaleString("en-US", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} mo${months === 1 ? "" : "s"} ago`;
}

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null) return "";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
