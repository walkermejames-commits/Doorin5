export type Doorin5Intake = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  pickupName?: string;
  pickupPhone?: string;
  pickupAddress?: string;
  pickupTown?: string;
  pickupPostcode?: string;
  pickupHint: string;
  dropoffAddress: string;
  dropoffTown?: string;
  dropoffPostcode: string;
  preferredDeliveryWindow?: string;
  stairsNotes?: string;
  accessNotes?: string;
  deliveryNotes?: string;
  itemTitle: string;
  itemSize?: string;
  approximateWeightKg?: number;
  fragile?: boolean;
  requiresTwoPeople?: boolean;
  requiresVan?: boolean;
};

export function validateIntake(input: Doorin5Intake) {
  const errors: string[] = [];
  if (!input.customerName?.trim()) errors.push("Customer name is required.");
  if (!input.customerPhone?.trim()) errors.push("Customer phone is required.");
  if (!input.pickupHint?.trim() && !input.pickupAddress?.trim()) errors.push("Pickup details are required.");
  if (!input.dropoffAddress?.trim()) errors.push("Dropoff address is required.");
  if (!input.dropoffPostcode?.trim()) errors.push("Dropoff postcode is required.");
  if (!input.itemTitle?.trim()) errors.push("Item title is required.");
  return errors;
}

export function intakeToOrderItems(input: Doorin5Intake) {
  return [
    {
      name: input.itemTitle.trim(),
      quantity: 1,
      notes: [input.itemSize, input.approximateWeightKg ? `${input.approximateWeightKg}kg` : null]
        .filter(Boolean)
        .join(" · ") || undefined,
      ageRestricted: false,
    },
  ];
}

export function intakeToOrderNotes(input: Doorin5Intake) {
  return [
    input.preferredDeliveryWindow ? `Window: ${input.preferredDeliveryWindow}` : null,
    input.stairsNotes ? `Stairs: ${input.stairsNotes}` : null,
    input.accessNotes ? `Access: ${input.accessNotes}` : null,
    input.deliveryNotes ? `Notes: ${input.deliveryNotes}` : null,
    input.fragile ? "Fragile item" : null,
    input.requiresTwoPeople ? "May require two people" : null,
    input.requiresVan ? "May require van" : null,
  ]
    .filter(Boolean)
    .join("\n");
}
