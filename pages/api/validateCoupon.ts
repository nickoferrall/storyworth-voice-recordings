import StripeManager from '../../lib/stripeManager'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { promotionCode } = req.body
  const stripeManager = new StripeManager()

  const promotion = await stripeManager.retrieveCouponByPromotionCode(promotionCode)
  if (!promotion || !promotion.coupon || promotion.coupon.valid === false) {
    res.status(400).json({ success: false, message: 'Invalid coupon.' })
    return
  }

  // Include the coupon ID in the response
  res
    .status(200)
    .json({ success: true, message: 'Valid coupon.', couponId: promotion.coupon.id })
}
