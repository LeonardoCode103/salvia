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
    'huevo, papa, chile, cebolla, aceite',
    'zanahoria, brócoli, pollo, limón, ajo',
    'atún, jitomate, cebolla, aguacate, limón'
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
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Georgia, serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button onClick={() => router.push('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#2d6a4f' }}>🌿 Sazonia</span>
        </button>
        <button onClick={() => router.push('/dashboard')} style={{
          fontSize: '13px', color: '#6b7280', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'Georgia, serif'
        }}>
          ← Volver al dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
            ¿Qué hay en tu cocina?
          </h1>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>
            Escribe los ingredientes que tienes y te genero recetas personalizadas al instante
          </p>
        </div>

        {/* Formulario */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '28px',
          border: '1px solid #f0f0f0', marginBottom: '28px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
              Tus ingredientes
            </label>
            <textarea
              placeholder="Ej: pollo, arroz, cebolla, ajo, jitomate, limón..."
              value={ingredientes}
              onChange={e => setIngredientes(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '14px', border: '1.5px solid #e5e7eb',
                borderRadius: '12px', fontSize: '14px', outline: 'none',
                background: '#fff', fontFamily: 'Georgia, serif', resize: 'vertical',
                color: '#111827', boxSizing: 'border-box', lineHeight: '1.6'
              }}
              onFocus={e => e.target.style.borderColor = '#2d6a4f'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />

            {/* Ejemplos rápidos */}
            <div style={{ marginTop: '12px', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
                Prueba con estos ejemplos:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ejemplos.map(ej => (
                  <button
                    key={ej} type="button"
                    onClick={() => setIngredientes(ej)}
                    style={{
                      fontSize: '12px', padding: '5px 12px', borderRadius: '20px',
                      border: '1px solid #e5e7eb', background: '#f9fafb',
                      color: '#4b5563', cursor: 'pointer', fontFamily: 'Georgia, serif',
                      transition: 'all .15s'
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.background = '#f0fdf4'
                      ;(e.currentTarget).style.borderColor = '#2d6a4f'
                      ;(e.currentTarget).style.color = '#1a4731'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.background = '#f9fafb'
                      ;(e.currentTarget).style.borderColor = '#e5e7eb'
                      ;(e.currentTarget).style.color = '#4b5563'
                    }}
                  >
                    {ej}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '10px', padding: '12px 14px', fontSize: '13px',
                color: '#dc2626', marginBottom: '14px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loading ? '#86efac' : 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
                color: '#fff', fontSize: '16px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif', transition: 'opacity .2s'
              }}
            >
              {loading ? '🔄 Generando tus recetas...' : '✨ Generar recetas'}
            </button>
          </form>
        </div>

        {/* Modo demo banner */}
        {modo === 'demo' && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
            color: '#92400e', marginBottom: '20px', textAlign: 'center'
          }}>
            🔧 Modo demo — recetas de ejemplo. Activa Claude con tu API key para recetas 100% personalizadas con tus ingredientes exactos.
          </div>
        )}

        {/* Recetas generadas */}
        {recetas.length > 0 && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
              🍽️ {recetas.length} recetas para ti
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recetas.map((receta, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '16px',
                  border: recetaAbierta === i ? '2px solid #2d6a4f' : '1px solid #f0f0f0',
                  overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'all .2s'
                }}>
                  {/* Header de la receta */}
                  <button
                    onClick={() => setRecetaAbierta(recetaAbierta === i ? null : i)}
                    style={{
                      width: '100%', padding: '20px 24px', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'Georgia, serif', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                          {receta.nombre}
                        </h3>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                          background: '#f0fdf4', color: '#166534', fontWeight: '600'
                        }}>
                          {receta.dificultad}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px', lineHeight: '1.5' }}>
                        {receta.descripcion}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>⏱️ {receta.tiempo}</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>👥 {receta.porciones} porciones</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>🥘 {receta.ingredientes?.length} ingredientes</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '20px', marginLeft: '16px', color: '#9ca3af' }}>
                      {recetaAbierta === i ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Detalle expandido */}
                  {recetaAbierta === i && (
                    <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f9fafb' }}>

                      {/* Ingredientes */}
                      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 10px' }}>
                          🛒 Ingredientes
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {receta.ingredientes?.map((ing, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              fontSize: '13px', color: '#4b5563', padding: '6px 10px',
                              background: '#f9fafb', borderRadius: '8px'
                            }}>
                              <span style={{ color: '#2d6a4f', fontWeight: '600' }}>•</span>
                              {ing}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pasos */}
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 10px' }}>
                          👨‍🍳 Preparación paso a paso
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {receta.pasos?.map((paso, j) => (
                            <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <span style={{
                                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #1a4731, #40916c)',
                                color: '#fff', fontSize: '11px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {j + 1}
                              </span>
                              <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.6', flex: 1 }}>
                                {paso}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Consejo */}
                      {receta.consejo && (
                        <div style={{
                          background: '#f0fdf4', borderRadius: '10px',
                          padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'flex-start'
                        }}>
                          <span style={{ fontSize: '16px' }}>💡</span>
                          <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: '1.5' }}>
                            <strong>Consejo:</strong> {receta.consejo}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}