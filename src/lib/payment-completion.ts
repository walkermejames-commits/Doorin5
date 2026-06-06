import { DeliveryOrder } from "./local-delivery";
import { buildStatusEvent } from "./status-events";
import { markPaymentCompleteStatus } from "./payment-safety";
import { paymentConfirmedEntry } from "./event-log";

export type PaymentCompletionInput = {
  order: DeliveryOrder;
  provider: "mock" | "stripe";
  providerSessionId?: string;
  providerPaymentId?: string;
  amountTotalPence?: number;
  currency?: string;
};

export function completePayment(input: PaymentCompletionInput) {
  const newStatus = markPaymentCompleteStatus(input.order.status);
  const updatedOrder: DeliveryOrder = {
    ...input.order,
    status: newStatus,
  };

  return {
    order: updatedOrder,
    statusEvent: buildStatusEvent(input.order.id, input.order.status, "system"),
    eventLogEntry: paymentConfirmedEntry(input.order.id, {
      provider: input.provider,
      providerSessionId: input.providerSessionId,
      providerPaymentId: input.providerPaymentId,
      amountTotalPence: input.amountTotalPence,
      currency: input.currency ?? "gbp",
    }),
  };
}
