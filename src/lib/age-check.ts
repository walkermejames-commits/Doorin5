export type AgeCheckInput = {
  orderId: string;
  checked: boolean;
  checkedBy?: string;
  checkNote?: string;
};

export function validateAgeCheck(input: AgeCheckInput) {
  const errors: string[] = [];
  if (!input.orderId?.trim()) errors.push("Order id is required.");
  if (!input.checked) errors.push("Age check must be confirmed.");
  return errors;
}

export function buildAgeCheck(input: AgeCheckInput) {
  return {
    orderId: input.orderId.trim(),
    checked: Boolean(input.checked),
    checkedBy: input.checkedBy?.trim() || "driver",
    checkNote: input.checkNote?.trim() ?? null,
    createdAt: new Date().toISOString(),
  };
}
