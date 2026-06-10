import Stripe from "stripe";
import { createMockCheckoutSession } from "../../../lib/checkout";
import { findDemoOrder } from "../../../lib/mock-orders";
import { jsonError, jsonOk } from "../../../lib/http";
import { getOrderById } from "../../../lib/order-repository";
import { getRuntimeConfig } from "../../../lib/runtime-config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!body.orderId) {
    return jsonError("orderId is required.");
  }

  let order;
  try {
    order = await getOrderById(body.orderId);
  } catch {
    order = findDemoOrder(body.orderId);
  }

  if (!order) {
    return jsonError("Order could not be found.", 404);
  }

  const config = getRuntimeConfig();
  if (config.stripeReady) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        currency: "gbp",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: `Doorin5 delivery ${order.id}` },
              unit_amount: order.estimatedFeePence,
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id, source: "doorin5-pilot" },
        success_url: `${appUrl}/track/${order.id}?checkout=success`,
        cancel_url: `${appUrl}/order?checkout=cancelled`,
      });

      return jsonOk(
        {
          provider: "stripe",
          sessionId: session.id,
          checkoutUrl: session.url,
          orderId: order.id,
          amountTotalPence: order.estimatedFeePence,
          currency: "gbp",
          status: "open",
          createdAt: new Date().toISOString(),
        },
        { status: 201 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Stripe checkout could not be created.";
      return jsonError(message, 500);
    }
  }

  return jsonOk({
    ...createMockCheckoutSession(order),
    provider: "mock",
  }, { status: 201 });
}
