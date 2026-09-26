import { Provider } from "ethers";

export async function resolveEnsIdentity(provider: Provider, name: string) {
  if (!name.endsWith(".eth")) return null;
  return provider.resolveName(name);
}

export const ENS_NOTES = {
  role: "Readable project and issuer identities",
  examples: ["tokyobay.tora.eth", "biochar.tora.eth"]
};
