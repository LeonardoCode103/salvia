'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { RegistroSchema } from '@/lib/schemas'

const condiciones = [
  { value: 'ninguna', label: 'Ninguna — solo recetas ricas', emoji: '😋' },
  { value: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { value: 'hipertension', label: 'Hipertensión', emoji: '❤️' },
  { value: 'colesterol', label: 'Colesterol alto', emoji: '🫀' },
  { value: 'enfermedad_celiaca', label: 'Enfermedad celíaca', emoji: '🌾' },
  { value: 'otro', label: 'Otra condición', emoji: '🏥' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 44px 12px 14px',
  border: '1.5px solid #d1d5db',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box',
  fontFamily: 'Georgia, serif',
  color: '#111827',
  WebkitTextFillColor: '#111827',
}

function OjoIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [form, setForm] = useState({
    nombre: '', email: '', password: '',
    condicion_salud: 'ninguna', acepta_privacidad: false
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
      email: form.email, password: form.password,
      options: { data: { nombre: form.nombre, condicion_salud: form.condicion_salud } }
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('perfiles').insert({
        id: user.id, nombre: form.nombre, condicion_salud: form.condicion_salud
      })
    }
    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #111827 !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          background-color: #ffffff !important;
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Georgia, serif', background: '#faf9f6' }}>

        {/* Panel izquierdo verde */}
        <div style={{
          width: '42%', minHeight: '100vh',
          background: 'linear-gradient(160deg, #1a4731 0%, #2d6a4f 60%, #40916c 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', padding: '60px 48px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-100px', right: '-100px',
            width: '350px', height: '350px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)'
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-80px',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)'
          }} />
          <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌿</div>
            <h1 style={{ fontSize: '40px', fontWeight: '700', color: '#fff', margin: '0 0 14px', letterSpacing: '-1px' }}>
              Sazonia
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', maxWidth: '260px', margin: '0 auto 40px' }}>
              Tu recetario inteligente. Recetas personalizadas según tu salud y lo que tienes en casa.
            </p>
            {['🤖  IA que usa tus ingredientes', '🏥  Recetas para tu condición de salud', '👥  Comunidad de cocineros'].map(item => (
              <div key={item} style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: '12px',
                padding: '13px 18px', color: 'rgba(255,255,255,0.92)',
                fontSize: '14px', textAlign: 'left', marginBottom: '10px'
              }}>{item}</div>
            ))}
          </div>
        </div>

        {/* Panel derecho formulario */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: '40px 32px', overflowY: 'auto'
        }}>
          <div style={{ width: '100%', maxWidth: '430px' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1a4731', margin: '0 0 6px' }}>
                Crear tu cuenta
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Únete gratis — sin tarjeta de crédito
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Nombre */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Nombre
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="¿Cómo te llamamos?"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    onFocus={() => setFocused('nombre')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...inputStyle,
                      padding: '12px 14px',
                      borderColor: focused === 'nombre' ? '#2d6a4f' : '#d1d5db',
                      boxShadow: focused === 'nombre' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...inputStyle,
                      padding: '12px 14px',
                      borderColor: focused === 'email' ? '#2d6a4f' : '#d1d5db',
                      boxShadow: focused === 'email' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Contraseña con ojito */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={verPassword ? 'text' : 'password'}
                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...inputStyle,
                      borderColor: focused === 'password' ? '#2d6a4f' : '#d1d5db',
                      boxShadow: focused === 'password' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <OjoIcon visible={verPassword} />
                  </button>
                </div>
              </div>

              {/* Condición de salud */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  ¿Tienes alguna condición de salud?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {condiciones.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, condicion_salud: c.value })}
                      style={{
                        padding: '10px 12px', borderRadius: '10px', fontSize: '12px',
                        border: form.condicion_salud === c.value ? '2px solid #2d6a4f' : '1.5px solid #e5e7eb',
                        background: form.condicion_salud === c.value ? '#f0fdf4' : '#ffffff',
                        color: form.condicion_salud === c.value ? '#1a4731' : '#4b5563',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'Georgia, serif',
                        fontWeight: form.condicion_salud === c.value ? '600' : '400',
                        transition: 'all .15s'
                      }}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacidad */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.acepta_privacidad}
                  onChange={e => setForm({ ...form, acepta_privacidad: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#2d6a4f', width: '15px', height: '15px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                  Acepto el aviso de privacidad. Mis datos de salud se usan solo para personalizar mis recetas y nunca se comparten con terceros.
                </span>
              </label>

              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#dc2626'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                  background: loading ? '#86efac' : 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Georgia, serif', letterSpacing: '0.3px', marginTop: '4px',
                  transition: 'opacity .2s'
                }}
              >
                {loading ? 'Creando tu cuenta...' : 'Crear cuenta gratis →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                ¿Ya tienes cuenta?{' '}
                <a href="/login" style={{ color: '#2d6a4f', fontWeight: '600', textDecoration: 'none' }}>
                  Inicia sesión
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}