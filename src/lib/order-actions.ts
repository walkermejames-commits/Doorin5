import { DeliveryOrder, OrderStatus, isLikelyServiceArea, nextStatuses } from "./local-delivery";

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupHint: string;
  pickupAddress?: string;
  dropoffAddress: string;
  postcode: string;
  urgency?: string;
  notes?: string;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    ageRestricted?: boolean;
  }>;
};

export function validateOrderInput(input: CreateOrderInput) {
  const errors: string[] = [];
  if (!input.customerName?.trim()) errors.push("Customer name is required.");
  if (!input.customerPhone?.trim()) errors.push("Customer phone is required.");
  if (input.customerPhone?.trim() && input.customerPhone.replace(/\D/g, "").length < 10) errors.push("Customer phone looks too short.");
  if (!input.pickupHint?.trim() && !input.pickupAddress?.trim()) errors.push("Pickup details are required.");
  if (!input.dropoffAddress?.trim()) errors.push("Dropoff address is required.");
  if (!input.postcode?.trim()) errors.push("Postcode is required.");
  if (input.postcode?.trim() && !isLikelyServiceArea(input.postcode)) errors.push("Postcode is outside the first demo service area.");
  if (!input.items?.length) errors.push("At least one item is required.");
  for (const item of input.items ?? []) {
    if (!item.name?.trim()) errors.push("Each item needs a name.");
    if (!Number.isFinite(item.quantity) || item.quantity < 1) errors.push("Each item needs a valid quantity.");
  }
  return errors;
}

export function buildRequestOrder(input: CreateOrderInput): DeliveryOrder {
  const ageCheckRequired = input.items.some((item) => item.ageRestricted);
  const now = new Date().toISOString();
  return {
    id: `demo-${Date.now()}`,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail?.trim() || undefined,
    pickupHint: input.pickupHint.trim(),
    pickupAddress: input.pickupAddress?.trim() || undefined,
    dropoffAddress: input.dropoffAddress.trim(),
    postcode: input.postcode.trim().toUpperCase(),
    dropoffPostcode: input.postcode.trim().toUpperCase(),
    urgency: input.urgency?.trim() || "ASAP",
    notes: input.notes?.trim(),
    items: input.items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity,
      notes: item.notes?.trim(),
      ageRestricted: Boolean(item.ageRestricted),
    })),
    status: "request_submitted",
    paymentStatus: "unpaid",
    estimatedFeePence: 0,
    ageCheckRequired,
    createdAt: now,
    updatedAt: now,
    quote: null,
  };
}

export const buildDraftOrder = buildRequestOrder;

export function progressStatus(status: OrderStatus) {
  return nextStatuses[status] ?? status;
}
