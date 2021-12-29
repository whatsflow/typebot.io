import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from 'services/api/utils'
import Stripe from 'stripe'

const usdPriceIdTest = 'price_1Jc4TQKexUFvKTWyGvsH4Ff5'
const createCheckoutSession = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === 'POST') {
    if (!process.env.STRIPE_SECRET_KEY)
      throw Error('STRIPE_SECRET_KEY var is missing')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    })
    const { email } = req.body
    const session = await stripe.checkout.sessions.create({
      success_url: `${req.headers.origin}/typebots?stripe=success`,
      cancel_url: `${req.headers.origin}/typebots?stripe=cancel`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_email: email,
      line_items: [
        {
          price: usdPriceIdTest,
          quantity: 1,
        },
      ],
    })
    res.status(201).json(session)
  }
  return methodNotAllowed(res)
}

export default createCheckoutSession