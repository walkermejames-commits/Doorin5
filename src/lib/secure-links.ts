import crypto from "node:crypto";
import { getAppUrl } from "./demo-mode";

export type DeliveryLinkPurpose = "customer_intake" | "seller_share" | "tracking";

export type DeliveryLinkPayload = {
  orderId?: string;
  itemTitle?: string;
  customerName?: string;
  pickupHint?: string;
  purpose?: DeliveryLinkPurpose;
};

export function generateDeliveryToken(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashDeliveryToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function buildPublicDeliveryLink(token: string, path = "/intake") {
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}${path}/${token}`;
}

export function createSecureDeliveryLink(payload: DeliveryLinkPayload = {}) {
  const token = generateDeliveryToken();
  const tokenHash = hashDeliveryToken(token);
  const link = buildPublicDeliveryLink(token);

  return {
    token,
    tokenHash,
    link,
    purpose: payload.purpose ?? "customer_intake",
    payload,
    createdAt: new Date().toISOString(),
  };
}

export function buildShareText(link: string, itemTitle = "your delivery") {
  return [
    `I can arrange local delivery for ${itemTitle} through Doorin5.`,
    `Please add the delivery details here: ${link}`,
    "Item payment stays separate unless agreed otherwise. This link is only for arranging delivery.",
  ].join("\n\n");
}
