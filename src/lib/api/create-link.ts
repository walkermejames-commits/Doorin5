import { buildShareText, createSecureDeliveryLink, DeliveryLinkPayload } from "../secure-links";

export function createLinkResponse(input: DeliveryLinkPayload = {}) {
  const secureLink = createSecureDeliveryLink(input);
  return {
    ...secureLink,
    shareText: buildShareText(secureLink.link, input.itemTitle),
  };
}
