'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 44px 13px 14px',
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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)
  const [verPass, setVerPass] = useState(false)
  const [verConfirm, setVerConfirm] = useState(false)
  const [focused, setFocused] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }
    if (!/[A-Z]/.test(password)) { setError('Necesita al menos una mayúscula'); return }
    if (!/[0-9]/.test(password)) { setError('Necesita al menos un número'); return }
    if (password !== confirmar) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }
    setListo(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
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
              Crea una nueva contraseña segura para tu cuenta.
            </p>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: '40px 32px'
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>

            {!listo ? (
              <>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
                  <h2 style={{ fontSize: '26px', fontWeight: '700', color: '#1a4731', margin: '0 0 6px' }}>
                    Nueva contraseña
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                    Elige una contraseña segura para tu cuenta de Sazonia.
                  </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Nueva contraseña */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Nueva contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={verPass ? 'text' : 'password'}
                        placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocused('pass')}
                        onBlur={() => setFocused('')}
                        style={{
                          ...inputStyle,
                          borderColor: focused === 'pass' ? '#2d6a4f' : '#d1d5db',
                          boxShadow: focused === 'pass' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                        }}
                      />
                      <button type="button" onClick={() => setVerPass(!verPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <OjoIcon visible={verPass} />
                      </button>
                    </div>
                  </div>

                  {/* Confirmar */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Confirmar contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={verConfirm ? 'text' : 'password'}
                        placeholder="Repite tu nueva contraseña"
                        value={confirmar}
                        onChange={e => setConfirmar(e.target.value)}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused('')}
                        style={{
                          ...inputStyle,
                          borderColor: focused === 'confirm' ? '#2d6a4f' : '#d1d5db',
                          boxShadow: focused === 'confirm' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none',
                        }}
                      />
                      <button type="button" onClick={() => setVerConfirm(!verConfirm)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <OjoIcon visible={verConfirm} />
                      </button>
                    </div>
                  </div>

                  {/* Indicador de seguridad */}
                  <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '12px 14px' }}>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px', fontWeight: '600' }}>Tu contraseña debe tener:</p>
                    {[
                      { check: password.length >= 8, text: 'Mínimo 8 caracteres' },
                      { check: /[A-Z]/.test(password), text: 'Al menos una mayúscula' },
                      { check: /[0-9]/.test(password), text: 'Al menos un número' },
                      { check: password === confirmar && confirmar.length > 0, text: 'Las contraseñas coinciden' },
                    ].map(item => (
                      <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: item.check ? '#16a34a' : '#d1d5db' }}>
                          {item.check ? '✓' : '○'}
                        </span>
                        <span style={{ fontSize: '12px', color: item.check ? '#16a34a' : '#9ca3af' }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
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
                    type="submit" disabled={loading}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
                      background: loading ? '#86efac' : 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
                      color: '#fff', fontSize: '15px', fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Georgia, serif', letterSpacing: '0.3px'
                    }}
                  >
                    {loading ? 'Guardando...' : 'Guardar nueva contraseña →'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a4731', margin: '0 0 12px' }}>
                  ¡Contraseña actualizada!
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                  Tu contraseña fue cambiada exitosamente. En 3 segundos te redirigimos al login...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}