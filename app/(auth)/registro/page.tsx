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

function friendlyError(msg: string): string {
  if (msg === 'Failed to fetch' || msg.includes('fetch'))
    return 'Sin conexión al servidor. Si el problema persiste, el servicio puede estar iniciando — intenta en 30 segundos.'
  if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists'))
    return 'Este correo ya tiene una cuenta. Inicia sesión.'
  if (msg.toLowerCase().includes('invalid email'))
    return 'El correo no es válido.'
  if (msg.toLowerCase().includes('password'))
    return 'La contraseña no cumple los requisitos mínimos.'
  return msg
}

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState(false)
  const [verPassword, setVerPassword] = useState(false)
  const [form, setForm] = useState({
    nombre: '', email: '', password: '',
    condicion_salud: 'ninguna', acepta_privacidad: false,
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
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { nombre: form.nombre, condicion_salud: form.condicion_salud },
      },
    })

    if (authError) {
      setError(friendlyError(authError.message))
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (userId) {
      await supabase.from('perfiles').upsert({
        id: userId,
        nombre: form.nombre,
        condicion_salud: form.condicion_salud,
      })
    }

    if (data.session) {
      router.push('/dashboard')
    } else {
      setConfirmacion(true)
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 0', border: 'none',
    borderBottom: '1.5px solid var(--border)', background: 'transparent',
    fontSize: '15px', color: 'var(--fg)', outline: 'none', transition: 'border-color .2s',
    WebkitTextFillColor: 'var(--fg)',
  }

  if (confirmacion) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '1.5px solid var(--accent-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10l5 5L17 4" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Cuenta creada
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.1, marginBottom: '20px' }}>
          Revisa tu<br /><em style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>correo.</em>
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
          Te enviamos un enlace de confirmación a <strong>{form.email}</strong>. Haz clic en él para activar tu cuenta.
        </p>
        <button
          onClick={() => router.push('/login')}
          style={{ padding: '14px 32px', background: 'var(--bg-dark)', color: 'var(--white)', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          Ir a iniciar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="auth-layout" style={{ background: 'var(--bg)' }}>

      {/* Panel izquierdo */}
      <div
        className="auth-panel-left"
        style={{
          background: 'var(--accent)', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: 'var(--gold)', letterSpacing: '0.08em' }}>Salvia</p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Nueva cuenta
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 5.5vw, 72px)', fontWeight: 300, color: 'var(--white)', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '32px' }}>
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
      <div
        className="auth-panel-right"
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px', overflowY: 'auto' }}
      >
        {/* Mobile logo */}
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 300, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: '32px', display: 'none' }}
          className="mobile-logo">
          Salvia
        </p>

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
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-light)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    {verPassword
                      ? <><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/><line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></>
                      : <><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.2"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.2"/></>
                    }
                  </svg>
                  {verPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

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
                      letterSpacing: '0.03em', transition: 'all .15s',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}
              onClick={() => setForm({ ...form, acepta_privacidad: !form.acepta_privacidad })}
            >
              <div style={{
                width: '18px', height: '18px', border: '1.5px solid', flexShrink: 0, marginTop: '2px',
                borderColor: form.acepta_privacidad ? 'var(--fg)' : 'var(--border)',
                background: form.acepta_privacidad ? 'var(--fg)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
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
              <div style={{ padding: '12px 16px', background: '#fdf0f0', border: '1px solid #f5c5c5', borderRadius: '2px' }}>
                <p style={{ fontSize: '13px', color: 'var(--red)', lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '16px', background: loading ? 'var(--fg-light)' : 'var(--bg-dark)',
                color: 'var(--white)', border: 'none', fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s',
              }}
            >
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

      <style>{`
        @media (max-width: 767px) {
          .mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  )
}
