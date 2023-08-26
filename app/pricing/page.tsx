import Stripe from "stripe";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link';
import SubscribeButton from "@/components/SubscribeButton";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-08-16",
});

export default async function Pricing() {
  const { data: prices } = await stripe.prices.list();
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profile")
    .select()
    .eq("id", data.user?.id)
    .single();

  const showSubscribeButton = !!data.user && !profile.is_subscribed;
  const showCreateAccountButton = !data.user;
  const showManageSubscription = !!data.user && profile.is_subscribed;

  const plans = await Promise.all(prices.map(async (price) => {
    const product = await stripe.products.retrieve(price.product);
    return {
      id: price.id,
      name: product.name,
      price: price.unit_amount,
      interval: price.recurring?.interval,
      currency: price.currency,
      isActive: price.active
    }
  }))

  const sortedPlans = plans.sort((a, b) => a.price - b.price).filter((e) => e.isActive)

  return (
    <div className="text-white w-full max-w-3xl mx-auto py-16 flex justify-around">
      {sortedPlans.map((plan) => (
        <div key={plan.id}>
          <h2>{plan.name}</h2>
          <p>
            R$ {plan.price / 100},00 / {plan.interval}
          </p>
          {showSubscribeButton && <SubscribeButton planId={plan.id} />}
          {showCreateAccountButton && <Link href="/login">Create Account</Link>}
          {showManageSubscription && <Link href="/dashboard"><a>Manage Subscription</a></Link>}
        </div>
      ))}
    </div>
  )
}