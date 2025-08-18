import { Currency } from '../src/generated/graphql'

export const currencySymbols: { [key in Currency]: string } = {
  // Existing currencies
  [Currency.Aud]: 'A$',
  [Currency.Eur]: '€',
  [Currency.Gbp]: '£',
  [Currency.Jpy]: '¥',
  [Currency.Usd]: '$',
  [Currency.Sr]: 'SR', // Added Saudi Riyal
  // New currencies
  [Currency.Cad]: 'C$', // Canadian Dollar
  [Currency.Chf]: 'CHF', // Swiss Franc
  [Currency.Cny]: '¥', // Chinese Yuan
  [Currency.Dkk]: 'kr', // Danish Krone
  [Currency.Hkd]: 'HK$', // Hong Kong Dollar
  [Currency.Nok]: 'kr', // Norwegian Krone
  [Currency.Nzd]: 'NZ$', // New Zealand Dollar
  [Currency.Sek]: 'kr', // Swedish Krona
  [Currency.Sgd]: 'S$', // Singapore Dollar
  [Currency.Zar]: 'R', // South African Rand
  [Currency.Aed]: 'د.إ', // UAE Dirham
  [Currency.Brl]: 'R$', // Brazilian Real
  [Currency.Inr]: '₹', // Indian Rupee
  [Currency.Mxn]: '$', // Mexican Peso
  [Currency.Thb]: '฿', // Thai Baht
}

export const currencies: { [key in Currency]: string } = {
  [Currency.Aud]: 'Australian Dollar',
  [Currency.Eur]: 'Euro',
  [Currency.Gbp]: 'British Pound',
  [Currency.Jpy]: 'Japanese Yen',
  [Currency.Usd]: 'US Dollar',
  [Currency.Cad]: 'Canadian Dollar',
  [Currency.Chf]: 'Swiss Franc',
  [Currency.Cny]: 'Chinese Yuan',
  [Currency.Dkk]: 'Danish Krone',
  [Currency.Hkd]: 'Hong Kong Dollar',
  [Currency.Nok]: 'Norwegian Krone',
  [Currency.Nzd]: 'New Zealand Dollar',
  [Currency.Sek]: 'Swedish Krona',
  [Currency.Sgd]: 'Singapore Dollar',
  [Currency.Zar]: 'South African Rand',
  [Currency.Aed]: 'UAE Dirham',
  [Currency.Brl]: 'Brazilian Real',
  [Currency.Inr]: 'Indian Rupee',
  [Currency.Mxn]: 'Mexican Peso',
  [Currency.Thb]: 'Thai Baht',
}
