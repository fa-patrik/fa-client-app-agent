/**
 * Distributes a trade amount with arbitrary decimals precision.
 * @param total the trade amount to distribute.
 * @param numSecurities nr of securities to distribute trade amount to.
 * @param decimals number of decimal places to maintain.
 * @returns A list of suggested trade amounts that should always summarize
 * to exactly the total.
 */
export function distributeTradeAmount(
  total: number,
  numSecurities: number,
  decimals = 2
): number[] {
  if (total <= 0 || numSecurities <= 0) {
    return [];
  }

  const scale = Math.pow(10, decimals);
  const scaledTotal = Math.round(total * scale);
  const baseAmount = Math.floor(scaledTotal / numSecurities);
  const remaining = scaledTotal - baseAmount * numSecurities;

  const distribution = new Array(numSecurities).fill(baseAmount);

  for (let i = 0; i < remaining; i++) {
    distribution[i]++;
  }

  return distribution.map((amount) => amount / scale);
}
