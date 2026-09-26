const ORDER_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  in_fulfilment: "Being prepared",
  completed: "Completed",
  partially_completed: "Partially completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
};

const VENDOR_ORDER_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "New order",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  collected: "Collected",
  delivered: "Delivered",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  refunded: "Refunded",
  disputed: "Disputed",
};

export function orderStatusLabel(s: string) {
  return ORDER_LABELS[s] ?? s.replace(/_/g, " ");
}

export function vendorOrderStatusLabel(s: string) {
  return VENDOR_ORDER_LABELS[s] ?? s.replace(/_/g, " ");
}

export function orderStatusTone(
  s: string,
): "green" | "amber" | "gray" | "blue" | "red" | "neutral" {
  if (["completed", "delivered", "collected", "ready_for_pickup"].includes(s))
    return "green";
  if (["paid", "accepted", "preparing", "in_fulfilment", "out_for_delivery"].includes(s))
    return "blue";
  if (["pending_payment"].includes(s)) return "amber";
  if (["cancelled", "rejected", "refunded", "disputed", "payment_failed"].includes(s))
    return "red";
  return "gray";
}

/** Customer-facing progress steps for a vendor order. */
export function fulfilmentSteps(fulfillment: "pickup" | "delivery") {
  return fulfillment === "pickup"
    ? ["paid", "accepted", "preparing", "ready_for_pickup", "collected", "completed"]
    : ["paid", "accepted", "preparing", "out_for_delivery", "delivered", "completed"];
}
