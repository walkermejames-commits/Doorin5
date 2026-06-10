import { DeliveryOrder, DeliveryQuote } from "./local-delivery";

export type MockCheckoutSession = {
  id: string;
  orderId: string;
  amountTotalPence: number;
  currency: "gbp";
  status: "open" | "paid";
  url: string;
  createdAt: string;
};

export function createMockCheckoutSession(order: DeliveryOrder, quote?: DeliveryQuote | null): MockCheckoutSession {
  return {
    id: `mock_checkout_${order.id}`,
    orderId: order.id,
    amountTotalPence: quote?.totalPence ?? order.quote?.totalPence ?? order.estimatedFeePence,
    currency: "gbp",
    status: "open",
    url: `/track/${order.id}?checkout=mock`,
    createdAt: new Date().toISOString(),
  };
}
