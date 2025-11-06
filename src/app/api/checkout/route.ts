import { NextResponse } from "next/server";
import Stripe from "stripe";
// import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function POST(request: Request) {
  try {
    const { plan, isMonthly, userId } = await request.json();

    const priceMap: Record<string, number> = {
      basic: isMonthly ? 49_00 : 500_00,
      medium: isMonthly ? 99_00 : 1000_00,
      pro: isMonthly ? 149_00 : 1500_00,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: `${plan.toUpperCase()} plan (${isMonthly ? "Mensual" : "Anual"})`,
            },
            unit_amount: priceMap[plan],
            recurring: {
              interval: isMonthly ? "month" : "year",
              interval_count: 1
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        userId,
      },
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
