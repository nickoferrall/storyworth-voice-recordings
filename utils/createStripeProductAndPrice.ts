import StripeManager from '../lib/stripeManager'
import { Currency } from '../src/generated/graphql'

type Props = {
  name: string
  amount: number
  currency: Currency
}

export const createStripeProductAndPrice = async (props: Props) => {
  const { name, amount, currency } = props
  const stripeManager = new StripeManager()
  const product = await stripeManager.createProduct(name)
  const stripePrice = await stripeManager.createPrice(amount * 100, currency, product.id)
  return { productId: product.id, priceId: stripePrice.id }
}
