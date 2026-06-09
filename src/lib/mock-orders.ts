import { DeliveryOrder } from "./local-delivery";

export const demoOrders: DeliveryOrder[] = [
  {
    id: "demo-1001",
    customerName: "Mr Tibbs",
    customerPhone: "07593 331380",
    pickupHint: "Any local shop with decent tea bags and milk",
    dropoffAddress: "The Pantiles, Tunbridge Wells",
    postcode: "TN2 5TN",
    notes: "Ring on arrival. Customer prefers contactless handover.",
    items: [
      { name: "Milk", quantity: 1 },
      { name: "Tea bags", quantity: 1 },
      { name: "Chocolate biscuits", quantity: 2 },
    ],
    status: "draft",
    paymentStatus: "unpaid",
    estimatedFeePence: 599,
    ageCheckRequired: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-1002",
    customerName: "Test Customer",
    customerPhone: "07000 000000",
    pickupHint: "Topps Pizza or closest open takeaway",
    dropoffAddress: "High Brooms, Tunbridge Wells",
    postcode: "TN4 9AA",
    notes: "Contains age restricted item. ID check required before handover.",
    items: [
      { name: "Pizza order", quantity: 1 },
      { name: "Bottle of wine", quantity: 1, ageRestricted: true },
    ],
    status: "assigned",
    paymentStatus: "paid",
    estimatedFeePence: 799,
    ageCheckRequired: true,
    driverId: "demo-driver-1",
    driverName: "Doorin5 Driver",
    createdAt: new Date().toISOString(),
  },
];

export function findDemoOrder(id: string) {
  return demoOrders.find((order) => order.id === id) ?? demoOrders[0];
}
