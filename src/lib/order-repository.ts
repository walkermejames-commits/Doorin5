import { buildDeliveryProof, DeliveryProofInput } from "./delivery-proof";
import { DriverProfile } from "./driver-assignment";
import {
  DeliveryOrder,
  DeliveryQuote,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  QuoteStatus,
  isDispatchable,
  nextStatuses,
  quoteTotalPence,
} from "./local-delivery";
import { CreateOrderInput, buildRequestOrder } from "./order-actions";
import { createSupabaseServerClient } from "./supabase-server";

type SupabaseOrderItemRow = {
  id?: string;
  name: string;
  quantity: number;
  notes?: string | null;
  age_restricted?: boolean | null;
};

type SupabaseQuoteRow = {
  id: string;
  order_id: string;
  item_estimate_pence: number;
  delivery_fee_pence: number;
  service_fee_pence: number;
  total_pence: number;
  fc_notes?: string | null;
  quote_status: QuoteStatus;
  expires_at?: string | null;
  created_at: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
};

type SupabaseOrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  pickup_hint: string;
  pickup_address?: string | null;
  dropoff_address: string;
  dropoff_postcode?: string | null;
  postcode?: string | null;
  urgency?: string | null;
  notes?: string | null;
  status: OrderStatus;
  estimated_fee_pence?: number | null;
  age_check_required: boolean;
  created_at: string;
  updated_at?: string | null;
  completed_at?: string | null;
  payment_status?: PaymentStatus | null;
  driver_id?: string | null;
  driver_name?: string | null;
  delivery_order_items?: SupabaseOrderItemRow[];
  delivery_quotes?: SupabaseQuoteRow[] | SupabaseQuoteRow | null;
};

type SupabaseDriverRow = {
  id: string;
  name: string;
  phone?: string | null;
  status?: DriverProfile["status"] | null;
  available?: boolean | null;
  active_jobs?: number | null;
};

export type QuoteInput = {
  orderId: string;
  itemEstimatePence: number;
  deliveryFeePence: number;
  serviceFeePence?: number;
  fcNotes?: string;
  expiresAt?: string;
};

const operationalStatuses: OrderStatus[] = [
  "request_submitted",
  "fc_reviewing",
  "quote_sent",
  "quote_accepted",
  "payment_pending",
  "paid",
  "assigned",
  "accepted",
  "shopping",
  "collected",
  "en_route",
  "delivered",
  "completed",
  "cancelled",
  "quote_expired",
  "quote_rejected",
];

const activeDriverStatuses: OrderStatus[] = ["assigned", "accepted", "shopping", "collected", "en_route", "delivered"];

export function mapSupabaseQuote(row: SupabaseQuoteRow): DeliveryQuote {
  return {
    id: row.id,
    orderId: row.order_id,
    itemEstimatePence: row.item_estimate_pence,
    deliveryFeePence: row.delivery_fee_pence,
    serviceFeePence: row.service_fee_pence,
    totalPence: row.total_pence,
    fcNotes: row.fc_notes ?? undefined,
    quoteStatus: row.quote_status,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at ?? null,
    rejectedAt: row.rejected_at ?? null,
  };
}

export function mapSupabaseOrder(row: SupabaseOrderRow): DeliveryOrder {
  const quotes = Array.isArray(row.delivery_quotes) ? row.delivery_quotes : row.delivery_quotes ? [row.delivery_quotes] : [];
  const quote = quotes.length > 0 ? mapSupabaseQuote(quotes.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]) : null;
  const postcode = row.dropoff_postcode ?? row.postcode ?? "";

  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email ?? undefined,
    pickupHint: row.pickup_hint,
    pickupAddress: row.pickup_address ?? undefined,
    dropoffAddress: row.dropoff_address,
    postcode,
    dropoffPostcode: postcode,
    urgency: row.urgency ?? undefined,
    notes: row.notes ?? undefined,
    items: (row.delivery_order_items ?? []).map(mapSupabaseOrderItem),
    quote,
    status: row.status,
    estimatedFeePence: row.estimated_fee_pence ?? quote?.deliveryFeePence ?? 0,
    ageCheckRequired: row.age_check_required,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    paymentStatus: row.payment_status ?? "unpaid",
    driverId: row.driver_id ?? null,
    driverName: row.driver_name ?? null,
    completedAt: row.completed_at ?? null,
  };
}

function mapSupabaseOrderItem(row: SupabaseOrderItemRow): OrderItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    notes: row.notes ?? undefined,
    ageRestricted: Boolean(row.age_restricted),
  };
}

function mapSupabaseDriver(row: SupabaseDriverRow): DriverProfile {
  return {
    id: row.id,
    name: row.name,
    status: row.status ?? "pending",
    available: row.available ?? true,
    activeJobs: row.active_jobs ?? 0,
  };
}

const orderSelect = "*, delivery_order_items(id, name, quantity, notes, age_restricted), delivery_quotes(*)";

export async function createOrderWithItems(input: CreateOrderInput) {
  const supabase = createSupabaseServerClient();
  const requestOrder = buildRequestOrder(input);

  const { data: order, error: orderError } = await supabase
    .from("delivery_orders")
    .insert({
      customer_name: requestOrder.customerName,
      customer_phone: requestOrder.customerPhone,
      customer_email: requestOrder.customerEmail,
      pickup_hint: requestOrder.pickupHint,
      pickup_address: requestOrder.pickupAddress,
      dropoff_address: requestOrder.dropoffAddress,
      dropoff_postcode: requestOrder.dropoffPostcode,
      postcode: requestOrder.dropoffPostcode,
      urgency: requestOrder.urgency,
      notes: requestOrder.notes,
      status: "request_submitted",
      estimated_fee_pence: 0,
      age_check_required: requestOrder.ageCheckRequired,
      payment_status: "unpaid",
    })
    .select("*")
    .single();

  if (orderError) throw orderError;

  const { error: itemError } = await supabase.from("delivery_order_items").insert(
    requestOrder.items.map((item) => ({
      order_id: order.id,
      name: item.name,
      quantity: item.quantity,
      notes: item.notes,
      age_restricted: Boolean(item.ageRestricted),
    }))
  );

  if (itemError) throw itemError;

  await insertStatusEvent(order.id, null, "request_submitted", "customer", "Customer submitted request for FC quote.");
  await insertEventLog("customer", "request_submitted", "order", order.id, { itemCount: requestOrder.items.length });
  return getOrderById(order.id);
}

export async function getOrderById(orderId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("delivery_orders").select(orderSelect).eq("id", orderId).single();
  if (error) throw error;
  return mapSupabaseOrder(data as SupabaseOrderRow);
}

export async function listOperationalOrders() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("delivery_orders")
    .select(orderSelect)
    .in("status", operationalStatuses)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapSupabaseOrder(row as SupabaseOrderRow));
}

export async function listOpenOrders() {
  const orders = await listOperationalOrders();
  return orders.filter((order) => activeDriverStatuses.includes(order.status) || isDispatchable(order));
}

export async function listDriverProfiles() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("driver_profiles")
    .select("id, name, phone, status, available, active_jobs")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapSupabaseDriver(row as SupabaseDriverRow));
}

export async function listDriverJobs(driverId?: string) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("delivery_orders")
    .select(orderSelect)
    .in("status", activeDriverStatuses)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });

  if (driverId) {
    query = query.eq("driver_id", driverId);
  } else {
    query = query.not("driver_id", "is", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => mapSupabaseOrder(row as SupabaseOrderRow));
}

export async function startFcReview(orderId: string) {
  const order = await getOrderById(orderId);
  if (!["request_submitted", "fc_reviewing"].includes(order.status)) {
    throw new Error("Only newly submitted requests can be moved into FC review.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("delivery_orders")
    .update({ status: "fc_reviewing", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
  if (order.status !== "fc_reviewing") {
    await insertStatusEvent(orderId, order.status, "fc_reviewing", "fc", "FC started reviewing the request.");
  }
  return getOrderById(orderId);
}

export async function cancelOrderByFc(orderId: string, note?: string) {
  const order = await getOrderById(orderId);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("delivery_orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
  await insertStatusEvent(orderId, order.status, "cancelled", "fc", note ?? "FC cancelled the request.");
  await insertEventLog("fc", "request_cancelled", "order", orderId, { note });
  return getOrderById(orderId);
}

export async function sendQuoteForOrder(input: QuoteInput) {
  const order = await getOrderById(input.orderId);
  if (["paid", "assigned", "accepted", "shopping", "collected", "en_route", "delivered", "completed"].includes(order.status)) {
    throw new Error("This order is already past quoting.");
  }

  const quotePayload = {
    order_id: input.orderId,
    item_estimate_pence: Math.max(0, Math.round(input.itemEstimatePence)),
    delivery_fee_pence: Math.max(0, Math.round(input.deliveryFeePence)),
    service_fee_pence: Math.max(0, Math.round(input.serviceFeePence ?? 0)),
    fc_notes: input.fcNotes?.trim() || null,
    quote_status: "sent" as QuoteStatus,
    expires_at: input.expiresAt || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  const totalPence = quoteTotalPence({
    itemEstimatePence: quotePayload.item_estimate_pence,
    deliveryFeePence: quotePayload.delivery_fee_pence,
    serviceFeePence: quotePayload.service_fee_pence,
  });

  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("delivery_quotes")
    .select("id")
    .eq("order_id", input.orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const quoteQuery = existing?.id
    ? supabase
        .from("delivery_quotes")
        .update({ ...quotePayload, total_pence: totalPence, accepted_at: null, rejected_at: null })
        .eq("id", existing.id)
        .select("*")
        .single()
    : supabase
        .from("delivery_quotes")
        .insert({ ...quotePayload, total_pence: totalPence })
        .select("*")
        .single();

  const { data: quote, error: quoteError } = await quoteQuery;
  if (quoteError) throw quoteError;

  const { error: orderError } = await supabase
    .from("delivery_orders")
    .update({
      status: "quote_sent",
      estimated_fee_pence: quotePayload.delivery_fee_pence,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  if (orderError) throw orderError;

  await insertStatusEvent(input.orderId, order.status, "quote_sent", "fc", "FC sent quote to customer.");
  await insertEventLog("fc", "quote_sent", "order", input.orderId, { quoteId: quote.id, totalPence });
  return { quote: mapSupabaseQuote(quote as SupabaseQuoteRow), order: await getOrderById(input.orderId) };
}

export async function acceptQuoteForOrder(orderId: string) {
  const order = await getOrderById(orderId);
  const quote = order.quote;
  if (!quote || quote.quoteStatus !== "sent") {
    throw new Error("No sent quote is available to accept.");
  }
  if (quote.expiresAt && new Date(quote.expiresAt).getTime() < Date.now()) {
    await markQuoteExpired(orderId, quote.id, order.status);
    throw new Error("This quote has expired.");
  }

  const supabase = createSupabaseServerClient();
  const { error: quoteError } = await supabase
    .from("delivery_quotes")
    .update({ quote_status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", quote.id);
  if (quoteError) throw quoteError;

  const { error: orderError } = await supabase
    .from("delivery_orders")
    .update({ status: "payment_pending", payment_status: "pending", updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (orderError) throw orderError;

  await insertStatusEvent(orderId, order.status, "quote_accepted", "customer", "Customer accepted FC quote.");
  await insertStatusEvent(orderId, "quote_accepted", "payment_pending", "system", "Waiting for checkout completion.");
  await insertEventLog("customer", "quote_accepted", "order", orderId, { quoteId: quote.id, totalPence: quote.totalPence });
  return getOrderById(orderId);
}

export async function rejectQuoteForOrder(orderId: string) {
  const order = await getOrderById(orderId);
  const quote = order.quote;
  if (!quote) throw new Error("No quote is available to reject.");

  const supabase = createSupabaseServerClient();
  const { error: quoteError } = await supabase
    .from("delivery_quotes")
    .update({ quote_status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", quote.id);
  if (quoteError) throw quoteError;

  const { error: orderError } = await supabase
    .from("delivery_orders")
    .update({ status: "quote_rejected", updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (orderError) throw orderError;

  await insertStatusEvent(orderId, order.status, "quote_rejected", "customer", "Customer rejected FC quote.");
  await insertEventLog("customer", "quote_rejected", "order", orderId, { quoteId: quote.id });
  return getOrderById(orderId);
}

export async function markPaymentComplete(orderId: string, quoteId?: string | null, details: Record<string, unknown> = {}) {
  const order = await getOrderById(orderId);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("delivery_orders")
    .update({
      payment_status: "paid",
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (error) throw error;

  await insertStatusEvent(orderId, order.status, "paid", "system", "Checkout completed.");
  await insertEventLog("system", "stripe_checkout_completed", "payment", orderId, { quoteId, ...details });
  return getOrderById(orderId);
}

async function markQuoteExpired(orderId: string, quoteId: string, fromStatus: OrderStatus) {
  const supabase = createSupabaseServerClient();
  await supabase.from("delivery_quotes").update({ quote_status: "expired" }).eq("id", quoteId);
  await supabase.from("delivery_orders").update({ status: "quote_expired", updated_at: new Date().toISOString() }).eq("id", orderId);
  await insertStatusEvent(orderId, fromStatus, "quote_expired", "system", "Quote expired before acceptance.");
}

export async function assignDriverToOrder(input: { orderId: string; driverId?: string; driverName?: string }) {
  const supabase = createSupabaseServerClient();
  const drivers = await listDriverProfiles();
  const driver =
    drivers.find((candidate) => candidate.id === input.driverId) ??
    drivers.find((candidate) => candidate.available !== false && ["approved", "active", "pending"].includes(candidate.status ?? "pending"));

  if (!driver) {
    throw new Error("No available driver profile exists in Supabase.");
  }

  const order = await getOrderById(input.orderId);
  if (!isDispatchable(order)) {
    throw new Error("Only paid orders can be assigned to a driver.");
  }

  const { error } = await supabase
    .from("delivery_orders")
    .update({
      driver_id: driver.id,
      driver_name: input.driverName ?? driver.name,
      status: "assigned",
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.orderId);

  if (error) throw error;

  const { error: driverError } = await supabase
    .from("driver_profiles")
    .update({ active_jobs: (driver.activeJobs ?? 0) + 1 })
    .eq("id", driver.id);

  if (driverError) throw driverError;

  await insertStatusEvent(input.orderId, order.status, "assigned", "fc", `Assigned to ${input.driverName ?? driver.name}.`);
  await insertEventLog("fc", "driver_assigned", "order", input.orderId, { driverId: driver.id, driverName: input.driverName ?? driver.name });

  return getOrderById(input.orderId);
}

export async function progressOrderInSupabase(input: { orderId: string; status?: OrderStatus; actor?: "driver" | "fc" | "system" }) {
  const order = await getOrderById(input.orderId);
  const nextStatus = nextStatuses[order.status];

  if (!nextStatus) {
    throw new Error("Order cannot progress from its current status.");
  }

  const supabase = createSupabaseServerClient();
  const patch: Record<string, string> = {
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  if (nextStatus === "accepted") patch.accepted_at = new Date().toISOString();
  if (nextStatus === "completed") patch.completed_at = new Date().toISOString();

  const { error } = await supabase.from("delivery_orders").update(patch).eq("id", input.orderId);
  if (error) throw error;

  await insertStatusEvent(input.orderId, order.status, nextStatus, input.actor ?? "driver");
  return getOrderById(input.orderId);
}

export async function completeDeliveryInSupabase(input: DeliveryProofInput) {
  const proof = buildDeliveryProof(input);
  const order = await getOrderById(input.orderId);
  const supabase = createSupabaseServerClient();

  const { error: proofError } = await supabase.from("delivery_proofs").insert({
    order_id: proof.orderId,
    proof_type: proof.proofType,
    proof_note: proof.proofNote,
    photo_url: proof.photoUrl,
    recipient_confirmed: proof.recipientConfirmed,
  });

  if (proofError) throw proofError;

  const { error: orderError } = await supabase
    .from("delivery_orders")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", proof.orderId);

  if (orderError) throw orderError;

  if (order.driverId) {
    const drivers = await listDriverProfiles();
    const driver = drivers.find((candidate) => candidate.id === order.driverId);
    if (driver) {
      await supabase
        .from("driver_profiles")
        .update({ active_jobs: Math.max(0, (driver.activeJobs ?? 1) - 1) })
        .eq("id", driver.id);
    }
  }

  await insertStatusEvent(proof.orderId, order.status, "completed", "driver", "Delivery completed with proof.");
  await insertEventLog("driver", "delivery_completed", "order", proof.orderId, {
    proofType: proof.proofType,
    recipientConfirmed: proof.recipientConfirmed,
  });

  return {
    proof,
    order: await getOrderById(proof.orderId),
  };
}

async function insertStatusEvent(
  orderId: string,
  fromStatus: OrderStatus | null,
  toStatus: OrderStatus,
  actor: "driver" | "system" | "customer" | "fc",
  note?: string
) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("delivery_status_events").insert({
    order_id: orderId,
    from_status: fromStatus,
    to_status: toStatus,
    actor,
    note,
  });
  if (error) throw error;
}

async function insertEventLog(
  actor: "system" | "driver" | "customer" | "fc",
  action: string,
  targetType: "order" | "payment" | "driver" | "link",
  targetId: string,
  details: Record<string, unknown> = {}
) {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("event_log_entries").insert({
    actor,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
  if (error) throw error;
}
