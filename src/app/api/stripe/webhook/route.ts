import Stripe from 'stripe';
import { createSupabaseServerClient } from '../../../../lib/supabase-server';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return Response.json({ ok: false, error: 'Stripe webhook is not configured.' }, { status: 400 });
  }

  const body = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-9-0' });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid Stripe signature.';
    return Response.json({ ok: false, error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return Response.json({ ok: true, received: true, note: 'No orderId in Stripe metadata.' }, { status: 200 });
    }

    try {
      const supabase = createSupabaseServerClient();
      const { data: existingOrder } = await supabase.from('delivery_orders').select('id,status,payment_status').eq('id', orderId).single();

      const nextStatus = existingOrder?.status === 'draft' ? 'paid' : existingOrder?.status ?? 'paid';
      const { error } = await supabase
        .from('delivery_orders')
        .update({
          payment_status: 'paid',
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      await supabase.from('delivery_status_events').insert({
        order_id: orderId,
        from_status: existingOrder?.status ?? 'draft',
        to_status: nextStatus,
        actor: 'system',
        note: 'Checkout completed via Stripe webhook.',
      }).catch(() => undefined);

      await supabase.from('event_log_entries').insert({
        actor: 'system',
        action: 'stripe_checkout_completed',
        target_type: 'payment',
        target_id: orderId,
        details: { sessionId: session.id, amountTotal: session.amount_total },
      }).catch(() => undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Webhook update failed.';
      return Response.json({ ok: true, received: true, warning: message }, { status: 200 });
    }
  }

  return Response.json({ ok: true, received: true }, { status: 200 });
}
