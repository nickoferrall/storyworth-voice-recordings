import Stripe from 'stripe'
import { Currency } from '../src/generated/graphql'

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export default class StripeManager {
  private stripe: Stripe

  constructor() {
    this.stripe = stripeClient
  }

  // async createPromotionCode(referralCode: string): Promise<Stripe.PromotionCode> {
  //   try {
  //     const promotionCode = await this.stripe.promotionCodes.create({
  //       coupon: process.env.STRIPE_REFERRAL_COUPON_ID,
  //       code: referralCode,
  //     })
  //     return promotionCode
  //   } catch (error: any) {
  //     console.error('Failed to create Stripe promotion code', error)
  //     throw error
  //   }
  // }

  async updateSubscriptionWithCoupon(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    try {
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        coupon: process.env.STRIPE_REFERRAL_COUPON_ID,
      })
      return updatedSubscription
    } catch (error: any) {
      console.error('Error updating subscription with coupon:', error)
      throw error
    }
  }

  async listAllPromotionCodes(): Promise<Stripe.PromotionCode[]> {
    try {
      const promotionCodes = await this.stripe.promotionCodes.list()
      return promotionCodes.data
    } catch (error: any) {
      console.error('Failed to list promotion codes', error)
      return []
    }
  }

  async retrieveCouponByPromotionCode(
    promotionCode: string,
  ): Promise<Stripe.PromotionCode | null> {
    try {
      const promotions = await this.stripe.promotionCodes.list({
        code: promotionCode,
      })

      const promotion = promotions.data[0]

      if (promotion) {
        return promotion
      }

      return null
    } catch (e) {
      console.error('Failed to retrieve Stripe promotion code', e)
      throw e
    }
  }

  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        name,
        description,
      })
      return product
    } catch (error: any) {
      console.error('Failed to create Stripe product', error)
      throw error
    }
  }

  async createPrice(
    unitAmount: number, // Price in cents
    currency: Currency,
    productId: string, // Product name
  ): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        unit_amount: unitAmount,
        currency: currency,
        product: productId,
      })
      return price
    } catch (error: any) {
      console.error('Error creating Stripe price:', error)
      throw error
    }
  }

  async updatePrice(
    priceId: string,
    updateParams: Stripe.PriceUpdateParams,
  ): Promise<Stripe.Price> {
    try {
      const updatedPrice = await this.stripe.prices.update(priceId, updateParams)
      return updatedPrice
    } catch (error: any) {
      console.error('Error updating Stripe price:', error)
      throw error
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: Currency,
    metadata: Record<string, string>,
  ): Promise<Stripe.PaymentIntent> {
    console.log('.....', process.env.STRIPE_SECRET_KEY)
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        metadata,
        setup_future_usage: 'off_session',
      })
      return paymentIntent
    } catch (error: any) {
      console.error('Failed to create Stripe payment intent', error)
      throw error
    }
  }

  async retrievePaymentIntent(clientSecret: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(clientSecret, {
        // expand: ['payment_method'],
      })
      return paymentIntent
    } catch (error: any) {
      console.error('Failed to retrieve Stripe payment intent', error)
      throw error
    }
  }

  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      })
      return customer
    } catch (error: any) {
      console.error('Failed to create Stripe customer', error)
      throw error
    }
  }

  async verifyPaymentSession(sessionId: string): Promise<{
    success: boolean
    sessionId: string
    metadata: Stripe.Metadata | null
    customerEmail: string
  }> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId)
      if (!session.customer_details?.email) {
        throw new Error('Customer email is missing from the session')
      }
      return {
        success: session.payment_status === 'paid',
        sessionId: session.id,
        metadata: session.metadata || null,
        customerEmail: session.customer_details.email,
      }
    } catch (error) {
      console.error('Error verifying payment session:', error)
      throw error
    }
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    customerEmail?: string, // Add customerEmail if you want to pre-fill it
    metadata?: Stripe.Metadata,
  ) {
    try {
      const isProd = process.env.NODE_ENV === 'production'
      const defaultSuccessUrl = isProd
        ? 'https://fitlo.co/thank-you'
        : 'http://localhost:3000/thank-you'
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'], // You can add more payment methods if needed
        line_items: lineItems, // Pass the line items (e.g., event ticket)
        mode: 'payment', // You can also use 'subscription' for recurring payments
        customer_email: customerEmail || undefined, // Pre-fill customer's email (optional)
        metadata: {
          ...metadata, // Add any metadata you want (e.g., event or user info)
        },
        allow_promotion_codes: true, // Allow promo codes
        // success_url: `${
        //   process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/thank-you'
        // }?session_id={CHECKOUT_SESSION_ID}`,
        success_url: `${
          process.env.PAYMENT_SUCCESS_URL || defaultSuccessUrl
        }?session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${process.env.PAYMENT_CANCEL_URL || 'https://fitlo.co/cancel'}`,
      })

      return { url: session.url, sessionId: session.id } // Return both URL and session ID
    } catch (error: any) {
      console.error('Error creating Stripe checkout session:', error)
      throw error
    }
  }

  async attachPaymentMethodToCustomer(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
      await this.stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      })
      return paymentMethod
    } catch (error: any) {
      console.error('Failed to attach payment method to customer', error)
      throw error
    }
  }
}
