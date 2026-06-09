export type DeliveryProofInput = {
  orderId: string;
  proofNote?: string;
  photoUrl?: string;
  recipientConfirmed?: boolean;
};

export function validateDeliveryProof(input: DeliveryProofInput) {
  const errors: string[] = [];
  if (!input.orderId?.trim()) errors.push("Order id is required.");
  if (!input.proofNote?.trim() && !input.photoUrl?.trim() && !input.recipientConfirmed) {
    errors.push("At least one proof detail is required.");
  }
  return errors;
}

export function buildDeliveryProof(input: DeliveryProofInput) {
  return {
    orderId: input.orderId.trim(),
    proofType: input.photoUrl ? "photo" : "text",
    proofNote: input.proofNote?.trim() ?? null,
    photoUrl: input.photoUrl?.trim() ?? null,
    recipientConfirmed: Boolean(input.recipientConfirmed),
    createdAt: new Date().toISOString(),
  };
}
