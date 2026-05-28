'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Receta = {
  nombre: string
  tiempo: string
  porciones: number
  dificultad: string
  descripcion: string
  ingredientes: string[]
  pasos: string[]
  consejo: string
}

export default function IAIngredientesPage() {
  const router = useRouter()
  const [ingredientes, setIngredientes] = useState('')
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recetaAbierta, setRecetaAbierta] = useState<number | null>(null)
  const [modo, setModo] = useState('')

  const ejemplos = [
    'pollo, arroz, cebolla, ajo, jitomate',
    'huevo, papa, chile, cebolla',
    'zanahoria, brócoli, pollo, limón',
    'atún, jitomate, aguacate, limón'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ingredientes.trim()) { setError('Escribe al menos un ingrediente'); return }
    setError('')
    setLoading(true)
    setRecetas([])
    setRecetaAbierta(null)
    try {
      const res = await fetch('/api/generar-receta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientes, condicion_salud: 'ninguna' })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setRecetas(data.recetas)
      setModo(data.modo)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Sazonia
        </button>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Dashboard
        </button>
      </nav>

      {/* Header */}
      <div style={{ padding: '64px 48px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '720px', paddingBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Inteligencia artificial
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            ¿Qué hay en<br /><em style={{ fontStyle: 'italic' }}>tu cocina?</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '40px' }}>
            Escribe los ingredientes que tienes disponibles y generamos recetas personalizadas adaptadas a tu condición de salud.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ borderBottom: '1.5px solid var(--fg)', marginBottom: '16px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '12px' }}>
              <input
                placeholder="pollo, arroz, cebolla, ajo, jitomate..."
                value={ingredientes}
                onChange={e => setIngredientes(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '18px', color: 'var(--fg)', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 300, letterSpacing: '-0.01em' }}
              />
              <button type="submit" disabled={loading} style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: loading ? 'var(--fg-light)' : 'var(--fg)', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', paddingBottom: '2px' }}>
                {loading ? 'Generando...' : 'Generar →'}
              </button>
            </div>

            {/* Ejemplos */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: '2px' }}>Prueba:</span>
              {ejemplos.map(ej => (
                <button key={ej} type="button" onClick={() => setIngredientes(ej)} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: '3px', padding: 0 }}>
                  {ej}
                </button>
              ))}
            </div>
          </form>

          {error && <p style={{ fontSize: '13px', color: 'var(--red)', marginTop: '16px' }}>— {error}</p>}
        </div>
      </div>

      {/* Resultados */}
      {recetas.length > 0 && (
        <div style={{ padding: '0 48px 80px' }}>

          {modo === 'demo' && (
            <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)', marginBottom: '0' }}>
              <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em' }}>
                Modo demo — Activa Claude API para recetas 100% personalizadas con tus ingredientes exactos.
              </p>
            </div>
          )}

          <div style={{ padding: '24px 0 0' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {recetas.length} recetas generadas
            </p>
          </div>

          {recetas.map((receta, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '24px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--fg)', margin: 0 }}>
                        {receta.nombre}
                      </h3>
                      <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-light)', border: '1px solid var(--border)', padding: '3px 8px' }}>
                        {receta.dificultad}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 16px', lineHeight: 1.6, maxWidth: '560px', fontWeight: 300 }}>
                      {receta.descripcion}
                    </p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.tiempo}</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.porciones} porciones</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.ingredientes?.length} ingredientes</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setRecetaAbierta(recetaAbierta === i ? null : i)}
                  style={{ background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg)', marginTop: '4px', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
                >
                  {recetaAbierta === i ? 'Cerrar' : 'Ver receta'}
                </button>
              </div>

              {recetaAbierta === i && (
                <div style={{ padding: '0 0 40px 88px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Ingredientes</p>
                    {receta.ingredientes?.map((ing, j) => (
                      <div key={j} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', minWidth: '24px' }}>{j + 1}</span>
                        <span style={{ fontSize: '14px', color: 'var(--fg)', fontWeight: 300 }}>{ing}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Preparación</p>
                    {receta.pasos?.map((paso, j) => (
                      <div key={j} style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--fg-light)', minWidth: '28px', fontWeight: 300 }}>{j + 1}</span>
                        <p style={{ fontSize: '14px', color: 'var(--fg)', margin: 0, lineHeight: 1.7, fontWeight: 300 }}>{paso}</p>
                      </div>
                    ))}
                    {receta.consejo && (
                      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Consejo</p>
                        <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, fontStyle: 'italic' }}>{receta.consejo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}