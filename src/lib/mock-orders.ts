import { DeliveryOrder, DeliveryQuote } from "./local-delivery";

const now = new Date().toISOString();
const soon = new Date(Date.now() + 30 * 60 * 1000).toISOString();

export const demoQuotes: DeliveryQuote[] = [
  {
    id: "quote-demo-1001",
    orderId: "demo-1001",
    itemEstimatePence: 1425,
    deliveryFeePence: 599,
    serviceFeePence: 150,
    totalPence: 2174,
    fcNotes: "We found everything at a nearby shop. Tea bags may be substituted for Yorkshire Tea if needed.",
    quoteStatus: "sent",
    expiresAt: soon,
    createdAt: now,
  },
  {
    id: "quote-demo-1002",
    orderId: "demo-1002",
    itemEstimatePence: 2899,
    deliveryFeePence: 799,
    serviceFeePence: 200,
    totalPence: 3898,
    fcNotes: "Paid demo job. Driver must check ID before handing over the wine.",
    quoteStatus: "accepted",
    expiresAt: soon,
    createdAt: now,
    acceptedAt: now,
  },
  {
    id: "quote-demo-1003",
    orderId: "demo-1003",
    itemEstimatePence: 0,
    deliveryFeePence: 0,
    serviceFeePence: 0,
    totalPence: 0,
    fcNotes: "FC is checking stock and distance before sending a quote.",
    quoteStatus: "draft",
    expiresAt: null,
    createdAt: now,
  },
];

export const demoOrders: DeliveryOrder[] = [
  {
    id: "demo-1001",
    customerName: "Mr Tibbs",
    customerPhone: "07593 331380",
    customerEmail: "demo@doorin5.local",
    pickupHint: "Any local shop with decent tea bags and milk",
    pickupAddress: "Camden Road or nearby",
    dropoffAddress: "The Pantiles, Tunbridge Wells",
    postcode: "TN2 5TN",
    dropoffPostcode: "TN2 5TN",
    urgency: "Tonight",
    notes: "Ring on arrival. Customer prefers contactless handover.",
    items: [
      { name: "Milk", quantity: 1, notes: "Semi-skimmed if possible" },
      { name: "Tea bags", quantity: 1, notes: "Decent brand please" },
      { name: "Chocolate biscuits", quantity: 2 },
    ],
    status: "quote_sent",
    paymentStatus: "unpaid",
    estimatedFeePence: 599,
    ageCheckRequired: false,
    quote: demoQuotes[0],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-1002",
    customerName: "Test Customer",
    customerPhone: "07000 000000",
    customerEmail: "test@doorin5.local",
    pickupHint: "Topps Pizza or closest open takeaway",
    pickupAddress: "High Brooms / St John's corridor",
    dropoffAddress: "High Brooms, Tunbridge Wells",
    postcode: "TN4 9AA",
    dropoffPostcode: "TN4 9AA",
    urgency: "ASAP",
    notes: "Contains age restricted item. ID check required before handover.",
    items: [
      { name: "Pizza order", quantity: 1, notes: "Pepperoni if available" },
      { name: "Bottle of wine", quantity: 1, ageRestricted: true },
    ],
    status: "assigned",
    paymentStatus: "paid",
    estimatedFeePence: 799,
    ageCheckRequired: true,
    quote: demoQuotes[1],
    driverId: "demo-driver-1",
    driverName: "Doorin5 Driver",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "demo-1003",
    customerName: "Queue Customer",
    customerPhone: "07000 333333",
    customerEmail: "queue@doorin5.local",
    pickupHint: "Closest open pharmacy",
    pickupAddress: "Southborough or Tunbridge Wells",
    dropoffAddress: "High Brooms, Tunbridge Wells",
    postcode: "TN4 9AA",
    dropoffPostcode: "TN4 9AA",
    urgency: "Within 60 minutes",
    notes: "Customer asked for non-drowsy cold medicine if available.",
    items: [
      { name: "Cold medicine", quantity: 1, notes: "Non-drowsy if available" },
      { name: "Tissues", quantity: 2 },
    ],
    status: "request_submitted",
    paymentStatus: "unpaid",
    estimatedFeePence: 0,
    ageCheckRequired: false,
    quote: null,
    createdAt: now,
    updatedAt: now,
  },
];

export function findDemoOrder(id: string) {
  return demoOrders.find((order) => order.id === id) ?? demoOrders[0];
}

export function findDemoQuote(orderId: string) {
  return demoQuotes.find((quote) => quote.orderId === orderId) ?? findDemoOrder(orderId).quote ?? null;
}
