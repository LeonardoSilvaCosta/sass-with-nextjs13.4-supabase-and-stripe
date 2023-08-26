import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { buffer } from "node:stream/consumers";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers';

export const config = { api: { bodyParser: false } }

interface CustomHeaders extends Headers {
  'stripe-signature'?: string;
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-08-16",
});

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const headers = req.headers as CustomHeaders;
  const signature = headers.get('stripe-signature');
  const signingSecret = String(process.env.STRIPE_SIGNING_SECRET);

  const reqBuffer = await buffer(req.body);

  let event

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, String(signature), signingSecret);

  } catch (error) {
    console.log("error", error);
    return new NextResponse(`Webhook error: ${error}`, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await supabase
        .from('profile')
        .update({
          is_subscribed: true,
          interval: event.data.object.items.data[0].plan.interval
        }).eq('stripe_customer', event.data.object.customer)
      break;
    case 'customer.subscription.deleted':
      await supabase
        .from('profile')
        .update({
          is_subscribed: false,
          interval: null
        }).eq('stripe_customer', event.data.object.customer)
      break;

  }
}