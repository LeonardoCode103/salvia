'use client'
import { useState } from 'react'

type Receta = {
  nombre: string
  descripcion: string
  tiempo?: string | number
  ingredientes: string[]
  pasos: string[]
}

export default function BotonCompartir({ receta, compact = false }: { receta: Receta; compact?: boolean }) {
  const [estado, setEstado] = useState<'idle' | 'copiado' | 'compartiendo'>('idle')

  const textoReceta = () => {
    const ings = receta.ingredientes.map(i => `• ${i}`).join('\n')
    const pasos = receta.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n')
    return `🌿 ${receta.nombre}
${receta.descripcion}

INGREDIENTES:
${ings}

PREPARACIÓN:
${pasos}

— Receta de Salvia · ${window.location.origin}`
  }

  const compartir = async () => {
    const texto = textoReceta()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        setEstado('compartiendo')
        await navigator.share({ title: receta.nombre, text: texto })
        setEstado('idle')
      } catch {
        setEstado('idle')
      }
      return
    }
    try {
      await navigator.clipboard.writeText(texto)
      setEstado('copiado')
      setTimeout(() => setEstado('idle'), 2000)
    } catch {
      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
      window.open(url, '_blank')
    }
  }

  const compartirWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(textoReceta())}`
    window.open(url, '_blank')
  }

  if (compact) {
    return (
      <button
        onClick={compartir}
        title="Compartir receta"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          color: estado === 'copiado' ? 'var(--accent-light)' : 'var(--fg-light)',
          padding: '4px 8px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}
      >
        {estado === 'copiado' ? '✓ Copiado' : '↗ Compartir'}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={compartir}
        style={{
          padding: '10px 16px', background: 'none',
          border: '1px solid var(--border)',
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
          cursor: 'pointer', color: estado === 'copiado' ? 'var(--accent-light)' : 'var(--fg)',
          transition: 'all .15s',
        }}
      >
        {estado === 'copiado' ? '✓ Copiado' : '↗ Compartir'}
      </button>
      <button
        onClick={compartirWhatsApp}
        style={{
          padding: '10px 16px', background: 'none',
          border: '1px solid var(--border)',
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
          cursor: 'pointer', color: '#25D366',
        }}
      >
        WhatsApp
      </button>
    </div>
  )
}
