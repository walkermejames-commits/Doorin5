import { QuoteClient } from "./QuoteClient";

export default async function QuotePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <QuoteClient orderId={orderId} />;
}
