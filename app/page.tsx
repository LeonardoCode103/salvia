import { redirect } from 'next/navigation'

type Parametros = { code?: string; error?: string; error_code?: string }

// Si la URL de retorno no está permitida en Supabase, el enlace del correo cae en la Site URL (esta raíz):
// se reenvía a /auth/callback para no perder la confirmación.
export default async function Home({ searchParams }: { searchParams: Promise<Parametros> }) {
  const { code, error, error_code } = await searchParams
  if (code || error || error_code) {
    const params = new URLSearchParams()
    if (code) params.set('code', code)
    if (error) params.set('error', error)
    if (error_code) params.set('error_code', error_code)
    redirect(`/auth/callback?${params}`)
  }
  redirect('/login')
}
