'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'salvia_onboarding_visto'

const slides = [
  {
    eyebrow: 'Bienvenido a Salvia',
    titulo: 'Cocina con<br/><em>intención.</em>',
    desc: 'Recetas mexicanas adaptadas a tu condición de salud. Sin culpa, sin sustos, sin azúcares escondidos.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 6c-6 6-6 14 0 20 6-6 6-14 0-20z" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M24 26v16M16 42h16" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    eyebrow: 'IA Chef',
    titulo: 'Lo que tienes<br/><em>en la cocina.</em>',
    desc: 'Dinos qué hay en tu refri y la IA genera 3 recetas al instante, adaptadas a tu salud y con pasos detallados.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 6l3.8 12.9L40 24l-12.2 5.1L24 42l-3.8-12.9L8 24l12.2-5.1L24 6z" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    eyebrow: 'Tu rutina',
    titulo: 'Mantén tu<br/><em>racha.</em>',
    desc: 'Plan semanal, racha diaria, desafíos y tu libro personal de recetas favoritas. Todo en un solo lugar.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 8c-3 0-5 2-5 5 0 4 4 5 4 9 0 2-1 4-3 4 8 0 14-7 14-15 0-3-2-5-4-5-1 0-2 1-2 2 0-1-1-2-2-2zM18 32c-3 0-5 3-5 6h22c0-3-2-6-5-6-2 0-3 1-4 3-1-2-2-3-4-3-2 0-3 1-4 3-1-2-2-3-4-3z" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function Onboarding() {
  const [mostrar, setMostrar] = useState(false)
  const [paso, setPaso] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setMostrar(true)
  }, [])

  const cerrar = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setMostrar(false)
  }

  const siguiente = () => {
    if (paso < slides.length - 1) setPaso(paso + 1)
    else cerrar()
  }

  if (!mostrar) return null

  const s = slides[paso]

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999,
      display: 'flex', flexDirection: 'column', padding: '32px 24px',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </p>
        <button
          onClick={cerrar}
          style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          Saltar
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '440px', width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>{s.icon}</div>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
          {s.eyebrow}
        </p>
        <h1
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 8vw, 56px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '24px' }}
          dangerouslySetInnerHTML={{ __html: s.titulo.replace('<em>', '<em style="font-style:italic;color:var(--accent-light)">') }}
        />
        <p style={{ fontSize: '16px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300 }}>
          {s.desc}
        </p>
      </div>

      {/* Bottom: pagination + CTA */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '32px' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === paso ? '24px' : '6px', height: '6px',
                background: i === paso ? 'var(--accent-light)' : 'var(--border)',
                transition: 'all .3s', borderRadius: '3px',
              }}
            />
          ))}
        </div>
        <button
          onClick={siguiente}
          style={{
            width: '100%', maxWidth: '440px', margin: '0 auto', display: 'block',
            padding: '18px', background: 'var(--bg-dark)', color: 'var(--white)',
            border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {paso < slides.length - 1 ? 'Siguiente' : 'Empezar a cocinar →'}
        </button>
      </div>
    </div>
  )
}
