import { DeliveryOrder, OrderStatus, PaymentStatus } from "./local-delivery";

export type PayableOrder = Pick<DeliveryOrder, "id" | "status"> & {
  paymentStatus?: PaymentStatus;
};

const payableStatuses: OrderStatus[] = ["quote_accepted", "payment_pending"];

export function canStartCheckout(order: PayableOrder) {
  if (order.paymentStatus === "paid" || order.paymentStatus === "mock_paid") {
    return { ok: false, reason: "This order has already been paid." };
  }

  if (!payableStatuses.includes(order.status)) {
    return { ok: false, reason: "An accepted FC quote is required before checkout can begin." };
  }

  return { ok: true, reason: null };
}

export function assertCanStartCheckout(order: PayableOrder) {
  const result = canStartCheckout(order);
  if (!result.ok) throw new Error(result.reason ?? "Checkout is not available.");
  return true;
}

export function markPaymentCompleteStatus(status: OrderStatus): OrderStatus {
  if (status === "quote_accepted" || status === "payment_pending") return "paid";
  return status;
}
