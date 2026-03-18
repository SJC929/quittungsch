export type { IPaymentProvider, Plan } from "./payment-provider.interface";
export { StripeProvider } from "./providers/stripe.provider";
export { DatatransProvider } from "./providers/datatrans.provider";
export {
  getActiveProvider,
  isPaymentEnabled,
  isTwintViaStripeEnabled,
  type ActiveProvider,
} from "./lib/feature-flags";

import { getActiveProvider } from "./lib/feature-flags";
import { StripeProvider } from "./providers/stripe.provider";
import { DatatransProvider } from "./providers/datatrans.provider";
import type { IPaymentProvider } from "./payment-provider.interface";

/**
 * Factory: returns the active payment provider instance.
 * Returns null if payments are disabled.
 */
export function getPaymentProvider(): IPaymentProvider | null {
  const provider = getActiveProvider();
  if (!provider) return null;
  if (provider === "stripe") return new StripeProvider();
  if (provider === "datatrans") return new DatatransProvider();
  return null;
}
