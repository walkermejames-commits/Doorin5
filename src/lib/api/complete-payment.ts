import { findDemoOrder } from "../mock-orders";
import { completePayment } from "../payment-completion";

export function completeDemoPaymentResponse(input: { orderId?: string; providerSessionId?: string; providerPaymentId?: string }) {
  const order = findDemoOrder(input.orderId ?? "demo-1001");
  return completePayment({
    order,
    provider: "mock",
    providerSessionId: input.providerSessionId ?? `mock_session_${order.id}`,
    providerPaymentId: input.providerPaymentId ?? `mock_payment_${order.id}`,
    amountTotalPence: order.estimatedFeePence,
    currency: "gbp",
  });
}
