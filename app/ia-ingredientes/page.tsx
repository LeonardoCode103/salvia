'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'
import { guardarReceta, estaGuardada } from '@/lib/recetas-guardadas'

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

const condicionLabels: Record<string, string> = {
  ninguna: 'Sin restricciones',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  colesterol: 'Colesterol alto',
  enfermedad_celiaca: 'Celiaquía',
  otro: 'Otra condición',
}

export default function IAIngredientesPage() {
  const router = useRouter()
  const [ingredientes, setIngredientes] = useState('')
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recetaAbierta, setRecetaAbierta] = useState<number | null>(null)
  const [modo, setModo] = useState('')
  const [condicionSalud, setCondicionSalud] = useState('ninguna')
  const [guardadas, setGuardadas] = useState<Set<string>>(new Set())

  const ejemplos = [
    'pollo, arroz, cebolla, ajo, jitomate',
    'huevo, papa, chile, cebolla',
    'zanahoria, brócoli, pollo, limón',
    'atún, jitomate, aguacate, limón',
  ]

  useEffect(() => {
    const cargarPerfil = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('perfiles').select('condicion_salud').eq('id', user.id).single()
      if (data?.condicion_salud) setCondicionSalud(data.condicion_salud)
    }
    cargarPerfil()
  }, [router])

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
        body: JSON.stringify({ ingredientes, condicion_salud: condicionSalud }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setRecetas(data.recetas)
      setModo(data.modo)
      setGuardadas(new Set(data.recetas.filter((r: Receta) => estaGuardada(r.nombre)).map((r: Receta) => r.nombre)))
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recetas</button>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Inicio</button>
        </div>
      </nav>

      {/* Header */}
      <div className="ia-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '720px', paddingBottom: '48px' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: condicionSalud !== 'ninguna' ? 'var(--accent-light)' : 'var(--fg-light)', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', margin: 0 }}>
              {condicionSalud !== 'ninguna'
                ? `Recetas para ${condicionLabels[condicionSalud]}`
                : 'Inteligencia artificial · Sin restricciones'}
            </p>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            ¿Qué hay en<br /><em style={{ fontStyle: 'italic' }}>tu cocina?</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '40px' }}>
            Escribe los ingredientes que tienes disponibles y la IA genera recetas personalizadas
            {condicionSalud !== 'ninguna' && ` adaptadas a tu ${condicionLabels[condicionSalud].toLowerCase()}`}.
          </p>

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
        <div className="page-body">
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            {modo === 'ia' ? (
              <p style={{ fontSize: '11px', color: 'var(--accent-light)', letterSpacing: '0.1em' }}>
                ✦ Recetas generadas con IA{condicionSalud !== 'ninguna' && ` · Adaptadas para ${condicionLabels[condicionSalud]}`}
              </p>
            ) : (
              <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em' }}>
                Recetas de ejemplo · Agrega tu clave de Gemini en Vercel para recetas personalizadas.
              </p>
            )}
          </div>

          <div style={{ padding: '24px 0 0' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {recetas.length} recetas generadas
            </p>
          </div>

          {recetas.map((receta, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '16px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', margin: 0 }}>
                        {receta.nombre}
                      </h3>
                      <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-light)', border: '1px solid var(--border)', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                        {receta.dificultad}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 14px', lineHeight: 1.6, maxWidth: '520px', fontWeight: 300 }}>
                      {receta.descripcion}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.tiempo}</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.porciones} porciones</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.ingredientes?.length} ingredientes</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  <button
                    onClick={() => setRecetaAbierta(recetaAbierta === i ? null : i)}
                    style={{ background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg)', transition: 'all .15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
                  >
                    {recetaAbierta === i ? 'Cerrar' : 'Ver receta'}
                  </button>
                  <button
                    onClick={() => {
                      if (!guardadas.has(receta.nombre)) {
                        guardarReceta(receta)
                        setGuardadas(new Set([...guardadas, receta.nombre]))
                      }
                    }}
                    disabled={guardadas.has(receta.nombre)}
                    style={{ background: guardadas.has(receta.nombre) ? 'var(--surface)' : 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', cursor: guardadas.has(receta.nombre) ? 'default' : 'pointer', color: guardadas.has(receta.nombre) ? 'var(--accent-light)' : 'var(--fg-muted)', whiteSpace: 'nowrap', transition: 'all .15s' }}
                  >
                    {guardadas.has(receta.nombre) ? '✓ Guardada' : '+ Guardar'}
                  </button>
                </div>
              </div>

              {recetaAbierta === i && (
                <div className="recipe-expand">
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
                      <div key={j} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-light)', minWidth: '28px', fontWeight: 300, lineHeight: 1.2 }}>{j + 1}</span>
                        <p style={{ fontSize: '14px', color: 'var(--fg)', margin: 0, lineHeight: 1.75, fontWeight: 300 }}>{paso}</p>
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

          <div style={{ marginTop: '48px', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '11px', color: 'var(--fg-light)', lineHeight: 1.6, maxWidth: '560px' }}>
              Las recetas son sugerencias orientativas generadas por inteligencia artificial. No sustituyen la orientación de un médico o nutriólogo. Consulta a un profesional de la salud antes de hacer cambios importantes en tu dieta.
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
