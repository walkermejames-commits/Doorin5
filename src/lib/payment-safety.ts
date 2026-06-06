import { DeliveryOrder, OrderStatus } from "./local-delivery";

export type PaymentStatus = "unpaid" | "mock_paid" | "paid" | "refunded" | "failed";

export type PayableOrder = Pick<DeliveryOrder, "id" | "status"> & {
  paymentStatus?: PaymentStatus;
};

const payableStatuses: OrderStatus[] = ["draft"];

export function canStartCheckout(order: PayableOrder) {
  if (order.paymentStatus === "paid" || order.paymentStatus === "mock_paid") {
    return { ok: false, reason: "This order has already been paid." };
  }

  if (!payableStatuses.includes(order.status)) {
    return { ok: false, reason: "Order must be confirmed before checkout can begin." };
  }

  return { ok: true, reason: null };
}

export function assertCanStartCheckout(order: PayableOrder) {
  const result = canStartCheckout(order);
  if (!result.ok) throw new Error(result.reason ?? "Checkout is not available.");
  return true;
}

export function markPaymentCompleteStatus(status: OrderStatus): OrderStatus {
  if (status === "draft") return "paid";
  return status;
}
