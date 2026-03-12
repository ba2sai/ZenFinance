/**
 * Convierte un monto según su frecuencia a su equivalente mensual.
 * Usado en Dashboard, useHistoricalData, y cualquier cálculo de flujo mensual.
 */
export function getMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly':  return amount;
    case 'biweekly': return amount * 2;
    case 'weekly':   return amount * 4;
    case 'yearly':   return amount / 12;
    case 'one-time': return 0;
    default:         return amount;
  }
}
