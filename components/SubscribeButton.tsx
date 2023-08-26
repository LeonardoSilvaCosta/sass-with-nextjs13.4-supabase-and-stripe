"use client";
import { loadStripe } from '@stripe/stripe-js'

type SubscribeButtonProps = {
  planId: string;
}

const stripePromise = loadStripe(String(process.env.NEXT_PUBLIC_STRIPE_KEY));

export default function SubscribeButton({ planId }: SubscribeButtonProps) {
  
  const processSubscription = async (planId: string) => {
    const res = await fetch(`/api/subscription/${planId}`);
    const { id } = await res.json();


    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: id })
  }

  return (
    <button
      className="border border-gray-700 rounded px-4 py-2 mb-2"
      onClick={() => processSubscription(planId)}
    >
      Subscribe
    </button>
  );
}