import { CreateOrderInput, buildDraftOrder } from "./order-actions";
import { createSupabaseServerClient } from "./supabase-server";

export async function createOrderWithItems(input: CreateOrderInput) {
  const supabase = createSupabaseServerClient();
  const draft = buildDraftOrder(input);

  const { data: order, error: orderError } = await supabase
    .from("delivery_orders")
    .insert({
      customer_name: draft.customerName,
      customer_phone: draft.customerPhone,
      pickup_hint: draft.pickupHint,
      dropoff_address: draft.dropoffAddress,
      postcode: draft.postcode,
      notes: draft.notes,
      status: "draft",
      estimated_fee_pence: draft.estimatedFeePence,
      age_check_required: draft.ageCheckRequired,
      payment_status: "unpaid",
    })
    .select("*")
    .single();

  if (orderError) throw orderError;

  const { error: itemError } = await supabase.from("delivery_order_items").insert(
    draft.items.map((item) => ({
      order_id: order.id,
      name: item.name,
      quantity: item.quantity,
      notes: item.notes,
      age_restricted: Boolean(item.ageRestricted),
    }))
  );

  if (itemError) throw itemError;

  return order;
}

export async function listOpenOrders() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("delivery_orders")
    .select("*, delivery_order_items(*)")
    .in("status", ["paid", "accepted", "shopping", "collected", "en_route", "delivered"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
