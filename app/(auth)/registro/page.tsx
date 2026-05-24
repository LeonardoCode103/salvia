'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { RegistroSchema } from '@/lib/schemas'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    condicion_salud: 'ninguna',
    acepta_privacidad: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = RegistroSchema.safeParse(form)
    if (!result.success) {
      const errores = result.error.flatten().fieldErrors
      const primerError = Object.values(errores).flat()[0]
      setError(primerError ?? 'Error de validación')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nombre: form.nombre,
          condicion_salud: form.condicion_salud
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('perfiles').insert({
        id: user.id,
        nombre: form.nombre,
        condicion_salud: form.condicion_salud
      })
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta en Sazonia</h1>
          <p className="text-gray-500 text-sm mt-1">Tu recetario inteligente y personalizado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={e => setForm({...form, nombre: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

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
              placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Tienes alguna condición de salud?
            </label>
            <select
              value={form.condicion_salud}
              onChange={e => setForm({...form, condicion_salud: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="ninguna">Ninguna — solo quiero recetas ricas</option>
              <option value="diabetes">Diabetes</option>
              <option value="hipertension">Hipertensión</option>
              <option value="colesterol">Colesterol alto</option>
              <option value="enfermedad_celiaca">Enfermedad celíaca</option>
              <option value="otro">Otra condición</option>
            </select>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <input
              type="checkbox"
              id="privacidad"
              checked={form.acepta_privacidad}
              onChange={e => setForm({...form, acepta_privacidad: e.target.checked})}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600"
            />
            <label htmlFor="privacidad" className="text-sm text-gray-600">
              Acepto el aviso de privacidad. Mis datos de salud se usan solo para personalizar mis recetas y nunca se comparten con terceros.
            </label>
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-green-600 hover:underline font-medium">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}