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
        success_url: 'http://localhost:3000/payment/sucess',
        cancel_url: 'http://localhost:3000/payment/cancelled',
      })

      console.log(session.id)

      return NextResponse.json({ id: session.id }, { status: 200 });


    } catch (error) {
      console.log("esse é um erro " + error)
    }
  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }
}