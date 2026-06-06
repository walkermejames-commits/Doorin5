import { DeliveryOrder } from "./local-delivery";

export type MockCheckoutSession = {
  id: string;
  orderId: string;
  amountTotalPence: number;
  currency: "gbp";
  status: "open" | "paid";
  url: string;
  createdAt: string;
};

export function createMockCheckoutSession(order: DeliveryOrder): MockCheckoutSession {
  return {
    id: `mock_checkout_${order.id}`,
    orderId: order.id,
    amountTotalPence: order.estimatedFeePence,
    currency: "gbp",
    status: "open",
    url: `/track-demo`,
    createdAt: new Date().toISOString(),
  };
}
