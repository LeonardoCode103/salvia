'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LoginSchema } from '@/lib/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = LoginSchema.safeParse(form)
    if (!result.success) {
      const errores = result.error.flatten().fieldErrors
      setError(Object.values(errores).flat()[0] ?? 'Error de validación')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (authError) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>

      {/* Panel izquierdo — Editorial */}
      <div style={{
        background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '48px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Textura de fondo */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, #fff 40px, #fff 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #fff 40px, #fff 41px)'
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: 'var(--gold)', letterSpacing: '0.08em' }}>
            Sazonia
          </p>
        </div>

        {/* Headline central */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gold)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
            Tu recetario inteligente
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 6vw, 80px)',
            fontWeight: 300, color: 'var(--white)', lineHeight: 1.05,
            letterSpacing: '-0.02em', marginBottom: '32px'
          }}>
            Cocina<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>con</em><br />
            intención.
          </h1>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)', marginBottom: '24px' }} />
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '320px', fontWeight: 300 }}>
            Recetas personalizadas para tu salud, generadas con inteligencia artificial a partir de lo que tienes en casa.
          </p>
        </div>

        {/* Features */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            {[
              { label: 'IA', desc: 'Recetas con tus ingredientes' },
              { label: 'Salud', desc: 'Adaptadas a tu condición' },
              { label: 'Comunidad', desc: 'Recetas de la comunidad' },
            ].map(f => (
              <div key={f.label}>
                <p style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>{f.label}</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 64px' }}>
        <div style={{ maxWidth: '400px', width: '100%' }}>

          <div style={{ marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Iniciar sesión
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.1 }}>
              Bienvenido<br />de vuelta.
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Correo electrónico
              </label>
              <input
                type="email" placeholder="tu@correo.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{
                  width: '100%', padding: '14px 0', border: 'none', borderBottom: '1.5px solid var(--border)',
                  background: 'transparent', fontSize: '15px', color: 'var(--fg)', outline: 'none',
                  transition: 'border-color .2s'
                }}
                onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
              />
            </div>

            {/* Contraseña */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <a href="/recuperar" style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.05em' }}>
                  ¿Olvidaste la tuya?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={verPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: '100%', padding: '14px 40px 14px 0', border: 'none',
                    borderBottom: '1.5px solid var(--border)', background: 'transparent',
                    fontSize: '15px', color: 'var(--fg)', outline: 'none', transition: 'border-color .2s'
                  }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setVerPassword(!verPassword)} style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-light)', fontSize: '12px',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>
                  {verPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: 'var(--red)', paddingTop: '4px' }}>— {error}</p>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: '8px', padding: '16px', background: loading ? 'var(--fg-light)' : 'var(--bg-dark)',
              color: 'var(--white)', border: 'none', fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background .2s'
            }}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--fg-muted)' }}>
              Sin cuenta —{' '}
              <a href="/registro" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--fg)', paddingBottom: '1px' }}>
                Regístrate gratis
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}