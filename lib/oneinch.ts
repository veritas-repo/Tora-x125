export type OneInchQuoteRequest = {
  chainId: number;
  src: string;
  dst: string;
  amount: string;
  from?: string;
};

export function buildOneInchQuoteUrl(request: OneInchQuoteRequest) {
  const base = process.env.NEXT_PUBLIC_ONEINCH_API_BASE || "https://api.1inch.dev";
  const params = new URLSearchParams({
    src: request.src,
    dst: request.dst,
    amount: request.amount
  });

  if (request.from) params.set("from", request.from);

  return `${base}/swap/v6.0/${request.chainId}/quote?${params.toString()}`;
}

/**
 * The public frontend only prepares quote URLs. Production requests should be
 * proxied through a server route so API credentials are never exposed to users.
 */
export const ONEINCH_NOTES = {
  role: "Optimised swap routing and stablecoin settlement",
  networks: ["Ethereum", "Base"]
};
