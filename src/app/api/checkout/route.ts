import Stripe from "stripe";
import { createMockCheckoutSession } from "../../../lib/checkout";
import { findDemoOrder, findDemoQuote } from "../../../lib/mock-orders";
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

  const quote = order.quote ?? findDemoQuote(order.id);
  if (!quote || quote.quoteStatus !== "accepted") {
    return jsonError("An accepted FC quote is required before checkout.", 400);
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
              product_data: { name: `Doorin5 quote ${quote.id}` },
              unit_amount: quote.totalPence,
            },
            quantity: 1,
          },
        ],
        metadata: { orderId: order.id, quoteId: quote.id, source: "doorin5-fc-led-quote" },
        success_url: `${appUrl}/track/${order.id}?checkout=success`,
        cancel_url: `${appUrl}/quote/${order.id}?checkout=cancelled`,
      });

      return jsonOk(
        {
          provider: "stripe",
          sessionId: session.id,
          checkoutUrl: session.url,
          orderId: order.id,
          quoteId: quote.id,
          amountTotalPence: quote.totalPence,
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

  return jsonOk(
    {
      ...createMockCheckoutSession(order, quote),
      provider: "mock",
      quoteId: quote.id,
    },
    { status: 201 }
  );
}
