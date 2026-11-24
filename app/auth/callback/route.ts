import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const errorCode = searchParams.get('error_code')

  if (errorParam || errorCode) {
    const motivo = errorCode === 'otp_expired' || errorParam === 'access_denied' ? 'link_expirado' : 'link_invalido'
    return NextResponse.redirect(`${origin}/login?mensaje=${motivo}`)
  }

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
    // Supabase ya confirmó el correo antes de redirigir; el intercambio falla si el enlace
    // se abre en otro navegador (sin el verificador PKCE), así que solo falta iniciar sesión.
    return NextResponse.redirect(`${origin}/login?mensaje=verificado`)
  }

  // Token-style links (#access_token=...) — manejados client-side
  return NextResponse.redirect(`${origin}/auth/callback-client`)
}
