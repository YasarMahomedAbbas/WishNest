export type Currency = 'USD' | 'EUR' | 'GBP'

/**
 * Simple currency symbol mapping
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€', 
  GBP: '£'
}

/**
 * Format a price with currency symbol
 */
export function formatPrice(price: number | null | undefined, currency: Currency = 'USD'): string {
  if (price === null || price === undefined) {
    return `${CURRENCY_SYMBOLS[currency]}0.00`
  }
  return `${CURRENCY_SYMBOLS[currency]}${price.toFixed(2)}`
}

/**
 * Get currency symbol for a given currency
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency]
}