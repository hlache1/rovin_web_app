import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const apiKey = process.env.WAHA_API_KEY!
  const cookieStore = await cookies()
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options); 
        },
        remove(name) {
          res.cookies.delete(name);
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessionName = 'default'
  //   const sessionName = user.email?.replace(/[@.]/g, '_') || 'default'

  const resp = await fetch(
    `${process.env.WHATSAPP_API_URL}/api/sessions/${sessionName}/restart`,
    {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
    }
  )

  if (!resp.ok) {
    return NextResponse.json(
      { error: 'Failed to restart session' },
      { status: resp.status }
    )
  }

  const data = await resp.json()
  return NextResponse.json(data)
}
