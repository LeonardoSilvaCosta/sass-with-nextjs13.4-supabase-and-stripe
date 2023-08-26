import { NextResponse, NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers'
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-08-16",
});

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json("Unauthorized", { status: 401 })
  }

  try {

    const { data: stripe_customer } = await supabase
      .from("profile")
      .select("stripe_customer")
      .eq("id", data.user.id)
      .single();

    const priceId = req.url.split('/').pop()

    const lineItems = [{
      price: priceId,
      quantity: 1,
    }]

    try {

      const session = await stripe.checkout.sessions.create({
        customer: stripe_customer?.stripe_customer,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${process.env.BASE_URL}/payment/sucess`,
        cancel_url: `${process.env.BASE_URL}/payment/cancelled`,
      })

      return NextResponse.json({ id: session.id }, { status: 200 });


    } catch (error) {
      console.log(error)
    }
  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }
}