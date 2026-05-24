'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LoginSchema } from '@/lib/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = LoginSchema.safeParse(form)
    if (!result.success) {
      const errores = result.error.flatten().fieldErrors
      const primerError = Object.values(errores).flat()[0]
      setError(primerError ?? 'Error de validación')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Bienvenido a Sazonia</h1>
          <p className="text-gray-500 text-sm mt-1">Inicia sesión para ver tus recetas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="/registro" className="text-green-600 hover:underline font-medium">
              Regístrate gratis
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}