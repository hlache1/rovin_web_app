import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: any) {
          res.cookies.set(name, value, options)
        },
        remove(name: string) {
          res.cookies.delete(name)
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas
  const isPublic = req.nextUrl.pathname.startsWith('/signin') ||
                   req.nextUrl.pathname.startsWith('/register')

  // Si no es pública, es protegida
  const isProtected = !isPublic

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Redirigir si entra a signin/register estando logged
  if (isPublic && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Verificar plan si está logueado y la ruta no es /billing
  if (user && isProtected && req.nextUrl.pathname !== '/billing') {
    const { data: profile } = await supabase
      .from('users_mirror')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (!profile?.plan) {
      return NextResponse.redirect(new URL('/billing', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
