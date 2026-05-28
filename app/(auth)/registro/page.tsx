'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { RegistroSchema } from '@/lib/schemas'

const condiciones = [
  { value: 'ninguna', label: 'Sin restricciones' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol', label: 'Colesterol alto' },
  { value: 'enfermedad_celiaca', label: 'Celiaquía' },
  { value: 'otro', label: 'Otra condición' },
]

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
      setError(Object.values(errores).flat()[0] ?? 'Error de validación')
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 0', border: 'none',
    borderBottom: '1.5px solid var(--border)', background: 'transparent',
    fontSize: '15px', color: 'var(--fg)', outline: 'none', transition: 'border-color .2s',
    WebkitTextFillColor: 'var(--fg)'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>

      {/* Panel izquierdo */}
      <div style={{
        background: 'var(--accent)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: 'var(--gold)', letterSpacing: '0.08em' }}>
            Sazonia
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Nueva cuenta
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 5.5vw, 72px)',
            fontWeight: 300, color: 'var(--white)', lineHeight: 1.05,
            letterSpacing: '-0.02em', marginBottom: '32px'
          }}>
            Empieza<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>a cocinar</em><br />
            mejor.
          </h1>
          <div style={{ width: '48px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '24px' }} />
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '300px', fontWeight: 300 }}>
            Únete gratis. Sin tarjeta de crédito. Recetas personalizadas en segundos.
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '28px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            Tus datos de salud son confidenciales y se usan únicamente para personalizar tus recetas.
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Crear cuenta
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.1 }}>
              Cuéntanos<br />sobre ti.
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Nombre */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Nombre completo
              </label>
              <input
                type="text" placeholder="Tu nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Correo electrónico
              </label>
              <input
                type="email" placeholder="tu@correo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={verPassword ? 'text' : 'password'}
                  placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: '60px' }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setVerPassword(!verPassword)} style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-light)',
                  fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase'
                }}>
                  {verPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {/* Condición de salud */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>
                Condición de salud
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {condiciones.map(c => (
                  <button
                    key={c.value} type="button"
                    onClick={() => setForm({ ...form, condicion_salud: c.value })}
                    style={{
                      padding: '10px 14px', border: '1px solid',
                      borderColor: form.condicion_salud === c.value ? 'var(--fg)' : 'var(--border)',
                      background: form.condicion_salud === c.value ? 'var(--fg)' : 'transparent',
                      color: form.condicion_salud === c.value ? 'var(--white)' : 'var(--fg-muted)',
                      fontSize: '12px', cursor: 'pointer', textAlign: 'left',
                      letterSpacing: '0.03em', transition: 'all .15s'
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacidad */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}
              onClick={() => setForm({ ...form, acepta_privacidad: !form.acepta_privacidad })}>
              <div style={{
                width: '18px', height: '18px', border: '1.5px solid', flexShrink: 0, marginTop: '2px',
                borderColor: form.acepta_privacidad ? 'var(--fg)' : 'var(--border)',
                background: form.acepta_privacidad ? 'var(--fg)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
              }}>
                {form.acepta_privacidad && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
                Acepto el aviso de privacidad. Mis datos de salud se usan solo para personalizar mis recetas.
              </span>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--red)' }}>— {error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '16px',
              background: loading ? 'var(--fg-light)' : 'var(--bg-dark)',
              color: 'var(--white)', border: 'none', fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s'
            }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--fg-muted)' }}>
              Ya tienes cuenta —{' '}
              <a href="/login" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--fg)', paddingBottom: '1px' }}>
                Inicia sesión
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}