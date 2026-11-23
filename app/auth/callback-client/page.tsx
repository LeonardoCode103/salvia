'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function CallbackClientPage() {
  const router = useRouter()

  useEffect(() => {
    const procesar = async () => {
      const supabase = createClient()
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        router.replace('/login?mensaje=link_expirado')
        return
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken, refresh_token: refreshToken,
        })
        if (!error) {
          router.replace('/dashboard')
          return
        }
      }

      // Si llegamos aquí, probablemente el usuario ya tenía sesión
      const { data: { user } } = await supabase.auth.getUser()
      router.replace(user ? '/dashboard' : '/login?mensaje=link_expirado')
    }
    procesar()
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        Confirmando cuenta...
      </p>
    </div>
  )
}
