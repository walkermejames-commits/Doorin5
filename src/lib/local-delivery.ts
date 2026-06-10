export type OrderStatus =
  | "request_submitted"
  | "fc_reviewing"
  | "quote_sent"
  | "quote_accepted"
  | "payment_pending"
  | "paid"
  | "assigned"
  | "accepted"
  | "shopping"
  | "collected"
  | "en_route"
  | "delivered"
  | "completed"
  | "cancelled"
  | "quote_expired"
  | "quote_rejected";

export type PaymentStatus = "unpaid" | "mock_paid" | "pending" | "paid" | "refunded" | "failed";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type OrderItem = {
  id?: string;
  name: string;
  quantity: number;
  notes?: string;
  ageRestricted?: boolean;
};

export type DeliveryQuote = {
  id: string;
  orderId: string;
  itemEstimatePence: number;
  deliveryFeePence: number;
  serviceFeePence: number;
  totalPence: number;
  fcNotes?: string;
  quoteStatus: QuoteStatus;
  expiresAt?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
};

export type DeliveryOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupHint: string;
  pickupAddress?: string;
  dropoffAddress: string;
  postcode: string;
  dropoffPostcode: string;
  urgency?: string;
  paymentStatus?: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  quote?: DeliveryQuote | null;
  status: OrderStatus;
  estimatedFeePence: number;
  ageCheckRequired: boolean;
  createdAt: string;
  updatedAt?: string;
  driverId?: string | null;
  driverName?: string | null;
  completedAt?: string | null;
};

export const serviceAreas = [
  "Tunbridge Wells",
  "Southborough",
  "High Brooms",
  "Rusthall",
  "Pembury",
  "Tonbridge",
  "Langton Green",
  "Speldhurst",
];

export const statusLabels: Record<OrderStatus, string> = {
  request_submitted: "Request sent",
  fc_reviewing: "FC reviewing",
  quote_sent: "Quote sent",
  quote_accepted: "Quote accepted",
  payment_pending: "Payment pending",
  paid: "Paid",
  assigned: "Driver assigned",
  accepted: "Accepted by driver",
  shopping: "Shopping / collecting",
  collected: "Collected",
  en_route: "On the way",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  quote_expired: "Quote expired",
  quote_rejected: "Quote rejected",
};

export const quoteStatusLabels: Record<QuoteStatus, string> = {
  draft: "Draft quote",
  sent: "Sent to customer",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired",
};

export const nextStatuses: Partial<Record<OrderStatus, OrderStatus>> = {
  paid: "assigned",
  assigned: "accepted",
  accepted: "shopping",
  shopping: "collected",
  collected: "en_route",
  en_route: "delivered",
  delivered: "completed",
};

export const customerLifecycle: OrderStatus[] = [
  "request_submitted",
  "fc_reviewing",
  "quote_sent",
  "quote_accepted",
  "paid",
  "assigned",
  "shopping",
  "en_route",
  "delivered",
  "completed",
];

export function isDispatchable(order: Pick<DeliveryOrder, "status" | "paymentStatus" | "driverId" | "driverName">) {
  return order.status === "paid" && order.paymentStatus === "paid" && !order.driverId && !order.driverName;
}

export function quoteTotalPence(input: Pick<DeliveryQuote, "itemEstimatePence" | "deliveryFeePence" | "serviceFeePence">) {
  return Math.max(0, input.itemEstimatePence) + Math.max(0, input.deliveryFeePence) + Math.max(0, input.serviceFeePence);
}

export function estimateDeliveryFee(postcode: string, ageCheckRequired = false) {
  const clean = postcode.trim().toUpperCase();
  const base = clean.startsWith("TN1") || clean.startsWith("TN2") || clean.startsWith("TN4") ? 599 : 899;
  return base + (ageCheckRequired ? 200 : 0);
}

export function isLikelyServiceArea(postcode: string) {
  const clean = postcode.trim().toUpperCase();
  return clean.startsWith("TN1") || clean.startsWith("TN2") || clean.startsWith("TN3") || clean.startsWith("TN4") || clean.startsWith("TN9") || clean.startsWith("TN10");
}

export function formatMoney(pence: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((Number.isFinite(pence) ? pence : 0) / 100);
}
