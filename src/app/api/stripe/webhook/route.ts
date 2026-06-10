import Stripe from "stripe";
import { markPaymentComplete } from "../../../../lib/order-repository";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return Response.json({ ok: false, error: "Stripe webhook is not configured." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe signature.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const quoteId = session.metadata?.quoteId;

    if (!orderId) {
      return Response.json({ ok: true, received: true, note: "No orderId in Stripe metadata." }, { status: 200 });
    }

    try {
      await markPaymentComplete(orderId, quoteId, {
        sessionId: session.id,
        amountTotal: session.amount_total,
        paymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook update failed.";
      return Response.json({ ok: true, received: true, warning: message }, { status: 200 });
    }
  }

  return Response.json({ ok: true, received: true }, { status: 200 });
}
