import { isDemoMode } from "../../../../lib/demo-mode";
import { jsonError, jsonOk } from "../../../../lib/http";
import { findDemoOrder, findDemoQuote } from "../../../../lib/mock-orders";
import { acceptQuoteForOrder, rejectQuoteForOrder, sendQuoteForOrder } from "../../../../lib/order-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  if (isDemoMode()) {
    return jsonOk({ mode: "demo", order: findDemoOrder(orderId), quote: findDemoQuote(orderId) });
  }

  try {
    const { getOrderById } = await import("../../../../lib/order-repository");
    const order = await getOrderById(orderId);
    return jsonOk({ mode: "supabase", order, quote: order.quote ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quote could not be loaded.";
    return jsonError(message, 404);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (isDemoMode()) {
    const order = findDemoOrder(orderId);
    const quote = findDemoQuote(orderId);

    if (action === "send") {
      const itemEstimatePence = toPence(body.itemEstimatePence);
      const deliveryFeePence = toPence(body.deliveryFeePence);
      const serviceFeePence = toPence(body.serviceFeePence);
      const demoQuote = {
        id: `quote-${orderId}`,
        orderId,
        itemEstimatePence,
        deliveryFeePence,
        serviceFeePence,
        totalPence: itemEstimatePence + deliveryFeePence + serviceFeePence,
        fcNotes: body.fcNotes ?? "Demo quote prepared by FC.",
        quoteStatus: "sent",
        expiresAt: body.expiresAt ?? new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      return jsonOk({ mode: "demo", order: { ...order, status: "quote_sent", quote: demoQuote }, quote: demoQuote });
    }

    if (action === "accept") {
      return jsonOk({
        mode: "demo",
        order: { ...order, status: "payment_pending", paymentStatus: "pending", quote: quote ? { ...quote, quoteStatus: "accepted" } : quote },
        quote: quote ? { ...quote, quoteStatus: "accepted" } : quote,
      });
    }

    if (action === "reject") {
      return jsonOk({
        mode: "demo",
        order: { ...order, status: "quote_rejected", quote: quote ? { ...quote, quoteStatus: "rejected" } : quote },
        quote: quote ? { ...quote, quoteStatus: "rejected" } : quote,
      });
    }

    return jsonOk({ mode: "demo", order, quote });
  }

  try {
    if (action === "send") {
      const result = await sendQuoteForOrder({
        orderId,
        itemEstimatePence: toPence(body.itemEstimatePence),
        deliveryFeePence: toPence(body.deliveryFeePence),
        serviceFeePence: toPence(body.serviceFeePence),
        fcNotes: body.fcNotes,
        expiresAt: body.expiresAt,
      });
      return jsonOk({ mode: "supabase", ...result }, { status: 201 });
    }

    if (action === "accept") {
      const order = await acceptQuoteForOrder(orderId);
      return jsonOk({ mode: "supabase", order, quote: order.quote });
    }

    if (action === "reject") {
      const order = await rejectQuoteForOrder(orderId);
      return jsonOk({ mode: "supabase", order, quote: order.quote });
    }

    return jsonError("Unsupported quote action.", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quote action failed.";
    return jsonError(message, 400);
  }
}

function toPence(value: unknown) {
  const number = typeof value === "string" ? Number(value) : typeof value === "number" ? value : 0;
  return Math.max(0, Math.round(number));
}
