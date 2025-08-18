import { Currency } from '../src/generated/graphql'
import { currencySymbols } from './constants'

export const toReadablePrice = (currency?: Currency | null, price?: number | null) => {
  if (!currency || !price) return 'Free'
  return `${currencySymbols[currency]}${price.toFixed(2)}`
}
