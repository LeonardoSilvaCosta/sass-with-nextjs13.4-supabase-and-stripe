import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from 'next/headers'

type Register = {
  record: {
    email: string,
    id: string,
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: "2023-08-16",
});

export async function POST(req: NextRequest) {
  const requestBody = await req.json() as Register;
  const API_ROUTE_SECRET = req.nextUrl.searchParams.get('API_ROUTE_SECRET');

  if (API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return new NextResponse("You are not authorized to call this API", { status: 401 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  const customer = await stripe.customers.create({
    email: requestBody.record.email,
  });

  try {
    await supabase
      .from('profile')
      .update({ stripe_customer: customer.id })
      .eq('id', requestBody.record.id);

    const message = `stripe customer created: ${customer.id}`;

    return new NextResponse(message, { status: 200 });
  } catch (error: any) {
    return new NextResponse(error, {
      status: 400,
    });
  }
}