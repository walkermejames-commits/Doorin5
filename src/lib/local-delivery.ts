export type OrderStatus =
  | "draft"
  | "paid"
  | "assigned"
  | "accepted"
  | "shopping"
  | "collected"
  | "en_route"
  | "delivered"
  | "completed"
  | "cancelled";

export type OrderItem = {
  name: string;
  quantity: number;
  notes?: string;
  ageRestricted?: boolean;
};

export type DeliveryOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupHint: string;
  dropoffAddress: string;
  postcode: string;
  notes?: string;
  items: OrderItem[];
  status: OrderStatus;
  estimatedFeePence: number;
  ageCheckRequired: boolean;
  createdAt: string;
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
  draft: "Draft",
  paid: "Paid",
  assigned: "Assigned to driver",
  accepted: "Accepted by driver",
  shopping: "Shopping / collecting",
  collected: "Collected",
  en_route: "On the way",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const nextStatuses: Partial<Record<OrderStatus, OrderStatus>> = {
  draft: "assigned",
  paid: "accepted",
  assigned: "accepted",
  accepted: "shopping",
  shopping: "collected",
  collected: "en_route",
  en_route: "delivered",
  delivered: "completed",
};

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
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);
}
