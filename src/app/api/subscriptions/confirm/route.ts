import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('session_id')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const plan = session.metadata?.plan
    const userId = session.metadata?.userId

    if (!plan || !userId) {
      return NextResponse.json({ error: 'Missing plan/userId metadata' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('users_mirror').update({ plan }).eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
