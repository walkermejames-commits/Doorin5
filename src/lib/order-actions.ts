import { DeliveryOrder, OrderStatus, estimateDeliveryFee, isLikelyServiceArea, nextStatuses } from "./local-delivery";

export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  pickupHint: string;
  dropoffAddress: string;
  postcode: string;
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
  if (!input.customerName.trim()) errors.push("Customer name is required.");
  if (!input.customerPhone.trim()) errors.push("Customer phone is required.");
  if (!input.pickupHint.trim()) errors.push("Pickup details are required.");
  if (!input.dropoffAddress.trim()) errors.push("Dropoff address is required.");
  if (!input.postcode.trim()) errors.push("Postcode is required.");
  if (!isLikelyServiceArea(input.postcode)) errors.push("Postcode is outside the first demo service area.");
  if (!input.items.length) errors.push("At least one item is required.");
  for (const item of input.items) {
    if (!item.name.trim()) errors.push("Each item needs a name.");
    if (!Number.isFinite(item.quantity) || item.quantity < 1) errors.push("Each item needs a valid quantity.");
  }
  return errors;
}

export function buildDraftOrder(input: CreateOrderInput): DeliveryOrder {
  const ageCheckRequired = input.items.some((item) => item.ageRestricted);
  return {
    id: `demo-${Date.now()}`,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    pickupHint: input.pickupHint.trim(),
    dropoffAddress: input.dropoffAddress.trim(),
    postcode: input.postcode.trim().toUpperCase(),
    notes: input.notes?.trim(),
    items: input.items.map((item) => ({
      name: item.name.trim(),
      quantity: item.quantity,
      notes: item.notes?.trim(),
      ageRestricted: Boolean(item.ageRestricted),
    })),
    status: "draft",
    estimatedFeePence: estimateDeliveryFee(input.postcode, ageCheckRequired),
    ageCheckRequired,
    createdAt: new Date().toISOString(),
  };
}

export function progressStatus(status: OrderStatus) {
  return nextStatuses[status] ?? status;
}
