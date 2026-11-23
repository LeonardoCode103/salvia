'use client'
import { useState } from 'react'

type Props = {
  nombre: string
  pasos: string[]
  ingredientes: string[]
  onCerrar: () => void
}

export default function ModoCocinar({ nombre, pasos, ingredientes, onCerrar }: Props) {
  const [paso, setPaso] = useState(0)
  const [verIngredientes, setVerIngredientes] = useState(false)

  const siguiente = () => paso < pasos.length - 1 && setPaso(paso + 1)
  const anterior = () => paso > 0 && setPaso(paso - 1)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9998,
      display: 'flex', flexDirection: 'column', padding: '24px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Modo cocinar
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.2 }}>
            {nombre}
          </p>
        </div>
        <button
          onClick={onCerrar}
          style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px' }}
        >
          ✕ Salir
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '32px' }}>
        {pasos.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1, height: '3px',
              background: i <= paso ? 'var(--accent-light)' : 'var(--border)',
              transition: 'background .2s',
            }}
          />
        ))}
      </div>

      <button
        onClick={() => setVerIngredientes(!verIngredientes)}
        style={{ background: 'none', border: '1px solid var(--border)', padding: '10px 16px', fontSize: '11px', color: 'var(--fg-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', alignSelf: 'flex-start', marginBottom: '24px' }}
      >
        {verIngredientes ? 'Ocultar' : 'Ver'} ingredientes
      </button>

      {verIngredientes && (
        <div style={{ background: 'var(--surface)', padding: '24px', marginBottom: '24px', maxHeight: '40vh', overflowY: 'auto' }}>
          {ingredientes.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < ingredientes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--fg-light)', minWidth: '24px' }}>{i + 1}</span>
              <span style={{ fontSize: '15px', color: 'var(--fg)', fontWeight: 300, lineHeight: 1.5 }}>{ing}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '600px', width: '100%', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
          Paso {paso + 1} de {pasos.length}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '96px', fontWeight: 300, color: 'var(--accent-light)', lineHeight: 1, marginBottom: '24px', fontStyle: 'italic' }}>
          {String(paso + 1).padStart(2, '0')}
        </p>
        <p style={{ fontSize: 'clamp(20px, 4vw, 26px)', color: 'var(--fg)', lineHeight: 1.6, fontWeight: 300 }}>
          {pasos[paso]}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
        <button
          onClick={anterior}
          disabled={paso === 0}
          style={{
            flex: 1, padding: '18px', background: 'none', border: '1px solid var(--border)',
            fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: paso === 0 ? 'not-allowed' : 'pointer',
            color: paso === 0 ? 'var(--fg-light)' : 'var(--fg)',
            opacity: paso === 0 ? 0.5 : 1,
          }}
        >
          ← Atrás
        </button>
        <button
          onClick={paso === pasos.length - 1 ? onCerrar : siguiente}
          style={{
            flex: 1, padding: '18px', background: 'var(--bg-dark)', color: 'var(--white)',
            border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          {paso === pasos.length - 1 ? '✓ Terminé' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
