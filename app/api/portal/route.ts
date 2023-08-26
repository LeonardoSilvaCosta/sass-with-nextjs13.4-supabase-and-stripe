import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers'
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-08-16",
});

export async function GET(req: NextResponse) {

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

    const session = await stripe.billingPortal.sessions.create({
      customer: stripe_customer?.stripe_customer,
      return_url: `${process.env.BASE_URL}/dashboard`
    })

    return NextResponse.json({ url: session.url }, { status: 200 });

  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }

}