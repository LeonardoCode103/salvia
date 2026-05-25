'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 14px',
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

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!email || !email.includes('@')) {
      setError('Escribe un email válido')
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (err) { setError(err.message); setLoading(false); return }
    setEnviado(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`* { box-sizing: border-box; }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Georgia, serif', background: '#faf9f6' }}>

        {/* Panel izquierdo */}
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
          <div style={{ textAlign: 'center', zIndex: 1, position: 'relative' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🌿</div>
            <h1 style={{ fontSize: '40px', fontWeight: '700', color: '#fff', margin: '0 0 14px', letterSpacing: '-1px' }}>
              Sazonia
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.7', maxWidth: '260px', margin: '0 auto' }}>
              No te preocupes, te ayudamos a recuperar el acceso a tu cuenta.
            </p>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: '40px 32px'
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>

            {!enviado ? (
              <>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
                  <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1a4731', margin: '0 0 6px' }}>
                    ¿Olvidaste tu contraseña?
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                    Escribe tu email y te mandamos un enlace para crear una nueva contraseña.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Email de tu cuenta
                    </label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      style={{
                        ...inputStyle,
                        borderColor: focused ? '#2d6a4f' : '#d1d5db',
                        boxShadow: focused ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                      }}
                    />
                  </div>

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
                      fontFamily: 'Georgia, serif', letterSpacing: '0.3px'
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación →'}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                    <a href="/login" style={{ color: '#2d6a4f', fontWeight: '600', textDecoration: 'none' }}>
                      ← Volver al login
                    </a>
                  </p>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>📧</div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a4731', margin: '0 0 12px' }}>
                  ¡Revisa tu email!
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
                  Te mandamos un enlace a <strong style={{ color: '#111827' }}>{email}</strong>. 
                  Revisa también tu carpeta de spam si no lo ves.
                </p>
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '12px', padding: '16px', marginBottom: '24px',
                  fontSize: '13px', color: '#166534', lineHeight: '1.5'
                }}>
                  💡 El enlace expira en <strong>1 hora</strong>. Si no llega en 5 minutos, revisa tu spam o intenta de nuevo.
                </div>
                <a href="/login" style={{
                  display: 'block', width: '100%', padding: '14px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '600',
                  textDecoration: 'none', textAlign: 'center', fontFamily: 'Georgia, serif'
                }}>
                  Volver al login
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}