import { buildDeliveryProof, DeliveryProofInput } from "./delivery-proof";
import { DriverProfile } from "./driver-assignment";
import { DeliveryOrder, OrderItem, OrderStatus, nextStatuses } from "./local-delivery";
import { CreateOrderInput, buildDraftOrder } from "./order-actions";
import { createSupabaseServerClient } from "./supabase-server";

type SupabaseOrderItemRow = {
  name: string;
  quantity: number;
  notes?: string | null;
  age_restricted?: boolean | null;
};

type SupabaseOrderRow = {
  id: string;
  customer_name: string;
  customer_phone: string;
  pickup_hint: string;
  dropoff_address: string;
  postcode: string;
  notes?: string | null;
  status: OrderStatus;
  estimated_fee_pence: number;
  age_check_required: boolean;
  created_at: string;
  completed_at?: string | null;
  payment_status?: "unpaid" | "mock_paid" | "paid" | "refunded" | "failed" | null;
  driver_id?: string | null;
  driver_name?: string | null;
  delivery_order_items?: SupabaseOrderItemRow[];
};

type SupabaseDriverRow = {
  id: string;
  name: string;
  phone?: string | null;
  status?: DriverProfile["status"] | null;
  available?: boolean | null;
  active_jobs?: number | null;
};

const operationalStatuses: OrderStatus[] = [
  "draft",
  "paid",
  "assigned",
  "accepted",
  "shopping",
  "collected",
  "en_route",
  "delivered",
  "completed",
];

const activeDriverStatuses: OrderStatus[] = ["assigned", "accepted", "shopping", "collected", "en_route", "delivered"];
const dispatchableStatuses: OrderStatus[] = ["draft", "paid"];

export function mapSupabaseOrder(row: SupabaseOrderRow): DeliveryOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    pickupHint: row.pickup_hint,
    dropoffAddress: row.dropoff_address,
    postcode: row.postcode,
    notes: row.notes ?? undefined,
    items: (row.delivery_order_items ?? []).map(mapSupabaseOrderItem),
    status: row.status,
    estimatedFeePence: row.estimated_fee_pence,
    ageCheckRequired: row.age_check_required,
    createdAt: row.created_at,
    paymentStatus: row.payment_status ?? "unpaid",
    driverId: row.driver_id ?? null,
    driverName: row.driver_name ?? null,
    completedAt: row.completed_at ?? null,
  };
}

function mapSupabaseOrderItem(row: SupabaseOrderItemRow): OrderItem {
  return {
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

const orderSelect = "*, delivery_order_items(name, quantity, notes, age_restricted)";

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

  await insertStatusEvent(order.id, null, "draft", "customer", "Customer created delivery request.");
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
  return orders.filter((order) => activeDriverStatuses.includes(order.status) || dispatchableStatuses.includes(order.status));
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
  if (!dispatchableStatuses.includes(order.status)) {
    throw new Error("Only draft or paid orders can be assigned.");
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
  const fromStatus = order.status;
  const nextStatus = nextStatuses[fromStatus];

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
