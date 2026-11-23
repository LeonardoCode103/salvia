'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const condiciones = [
  { value: 'ninguna', label: 'Sin restricciones' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol', label: 'Colesterol alto' },
  { value: 'enfermedad_celiaca', label: 'Celiaquía' },
  { value: 'otro', label: 'Otra condición' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 0', border: 'none',
  borderBottom: '1.5px solid var(--border)', background: 'transparent',
  fontSize: '15px', color: 'var(--fg)', outline: 'none',
  transition: 'border-color .2s', WebkitTextFillColor: 'var(--fg)',
  fontFamily: 'var(--font-body)'
}

export default function NuevaRecetaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tiempoMinutos, setTiempoMinutos] = useState('')
  const [porciones, setPorciones] = useState('')
  const [condicionesAptas, setCondicionesAptas] = useState<string[]>(['ninguna'])
  const [ingredientes, setIngredientes] = useState(['', '', ''])
  const [pasos, setPasos] = useState(['', '', ''])

  const toggleCondicion = (val: string) => setCondicionesAptas(prev => prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val])
  const updateIngrediente = (i: number, val: string) => { const n = [...ingredientes]; n[i] = val; setIngredientes(n) }
  const updatePaso = (i: number, val: string) => { const n = [...pasos]; n[i] = val; setPasos(n) }
  const agregarIngrediente = () => setIngredientes([...ingredientes, ''])
  const agregarPaso = () => setPasos([...pasos, ''])
  const eliminarIngrediente = (i: number) => { if (ingredientes.length <= 2) return; setIngredientes(ingredientes.filter((_, idx) => idx !== i)) }
  const eliminarPaso = (i: number) => { if (pasos.length <= 2) return; setPasos(pasos.filter((_, idx) => idx !== i)) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const ingFiltrados = ingredientes.filter(i => i.trim())
    const pasosFiltrados = pasos.filter(p => p.trim())
    if (!titulo.trim() || titulo.length < 5) { setError('El título debe tener al menos 5 caracteres'); return }
    if (!descripcion.trim() || descripcion.length < 20) { setError('La descripción debe tener al menos 20 caracteres'); return }
    if (!tiempoMinutos || parseInt(tiempoMinutos) < 1) { setError('Agrega el tiempo de preparación'); return }
    if (!porciones || parseInt(porciones) < 1) { setError('Agrega el número de porciones'); return }
    if (ingFiltrados.length < 2) { setError('Agrega al menos 2 ingredientes'); return }
    if (pasosFiltrados.length < 2) { setError('Agrega al menos 2 pasos'); return }
    if (condicionesAptas.length === 0) { setError('Selecciona al menos una condición'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error: dbError } = await supabase.from('recetas').insert({
      autor_id: user.id, titulo: titulo.trim(), descripcion: descripcion.trim(),
      tiempo_minutos: parseInt(tiempoMinutos), porciones: parseInt(porciones),
      ingredientes: ingFiltrados, pasos: pasosFiltrados,
      condiciones_aptas: condicionesAptas, likes_count: 0
    })
    if (dbError) { setError('Error al publicar. Intenta de nuevo.'); setLoading(false); return }
    await supabase.from('puntos').insert({ user_id: user.id, cantidad: 50, motivo: 'Publicó una receta' })
    setExito(true)
    setLoading(false)
  }

  if (exito) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', padding: '48px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '24px' }}>Publicada</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.1, marginBottom: '16px' }}>
          Tu receta<br /><em style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>ya está viva.</em>
        </h2>
        <div style={{ width: '1px', height: '48px', background: 'var(--border)', margin: '32px auto' }} />
        <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginBottom: '8px' }}>La comunidad ya puede verla.</p>
        <p style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 500, marginBottom: '40px', letterSpacing: '0.05em' }}>+50 puntos ganados</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => router.push('/recetas')} style={{ padding: '12px 24px', background: 'var(--fg)', color: 'var(--white)', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Ver recetas
          </button>
          <button onClick={() => { setExito(false); setTitulo(''); setDescripcion(''); setTiempoMinutos(''); setPorciones(''); setIngredientes(['', '', '']); setPasos(['', '', '']); setCondicionesAptas(['ninguna']) }} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Publicar otra
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)' }}>
          Salvia
        </button>
        <button onClick={() => router.push('/recetas')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Volver a recetas
        </button>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 48px) 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Nueva receta — +50 puntos
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
            Comparte tu<br /><em style={{ fontStyle: 'italic' }}>receta.</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

          {/* Título */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Nombre de la receta
            </label>
            <input
              type="text" placeholder="Ej: Caldo de pollo con verduras"
              value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={100}
              style={{ ...inputStyle, fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 300 }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
            />
            <p style={{ fontSize: '11px', color: 'var(--fg-light)', marginTop: '8px', textAlign: 'right' }}>{titulo.length}/100</p>
          </div>

          {/* Descripción */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Descripción breve
            </label>
            <textarea
              placeholder="¿Por qué es especial? ¿Para qué condición es ideal?"
              value={descripcion} onChange={e => setDescripcion(e.target.value)}
              rows={3} maxLength={500}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7', borderBottom: '1.5px solid var(--border)' }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
              onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
            />
            <p style={{ fontSize: '11px', color: 'var(--fg-light)', marginTop: '8px', textAlign: 'right' }}>{descripcion.length}/500</p>
          </div>

          {/* Tiempo y porciones */}
          <div className="time-grid">
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Tiempo de preparación
              </label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <input
                  type="number" placeholder="30" value={tiempoMinutos}
                  onChange={e => setTiempoMinutos(e.target.value)} min="1" max="480"
                  style={{ ...inputStyle, width: '80px', fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                />
                <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>minutos</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Porciones
              </label>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <input
                  type="number" placeholder="4" value={porciones}
                  onChange={e => setPorciones(e.target.value)} min="1" max="20"
                  style={{ ...inputStyle, width: '80px', fontSize: '24px', fontFamily: 'var(--font-display)', fontWeight: 300 }}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                />
                <span style={{ fontSize: '13px', color: 'var(--fg-muted)' }}>personas</span>
              </div>
            </div>
          </div>

          {/* Condiciones */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Apta para — selecciona todas las que apliquen
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {condiciones.map(c => (
                <button key={c.value} type="button" onClick={() => toggleCondicion(c.value)} style={{
                  padding: '8px 16px', border: '1px solid',
                  borderColor: condicionesAptas.includes(c.value) ? 'var(--fg)' : 'var(--border)',
                  background: condicionesAptas.includes(c.value) ? 'var(--fg)' : 'transparent',
                  color: condicionesAptas.includes(c.value) ? 'var(--white)' : 'var(--fg-muted)',
                  fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all .15s'
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          {/* Ingredientes */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Ingredientes
            </label>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ingredientes.map((ing, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', minWidth: '28px', paddingTop: '14px', paddingBottom: '14px' }}>{String(i + 1).padStart(2, '0')}</span>
                  <input
                    type="text" placeholder={`Ingrediente ${i + 1}`}
                    value={ing} onChange={e => updateIngrediente(i, e.target.value)}
                    style={{ ...inputStyle, border: 'none', borderBottom: 'none', flex: 1, padding: '14px 0' }}
                    onFocus={e => e.target.style.color = 'var(--fg)'}
                  />
                  {ingredientes.length > 2 && (
                    <button type="button" onClick={() => eliminarIngrediente(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-light)', fontSize: '18px', paddingTop: '14px', paddingBottom: '14px' }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={agregarIngrediente} style={{ marginTop: '16px', background: 'none', border: 'none', fontSize: '11px', fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: 0 }}>
              + Agregar ingrediente
            </button>
          </div>

          {/* Pasos */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px' }}>
              Preparación paso a paso
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pasos.map((paso, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--fg-light)', minWidth: '28px', paddingTop: '10px', fontWeight: 300 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <textarea
                      placeholder={`Describe el paso ${i + 1} con detalle...`}
                      value={paso} onChange={e => updatePaso(i, e.target.value)} rows={2}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7' }}
                      onFocus={e => e.target.style.borderBottomColor = 'var(--fg)'}
                      onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
                    />
                  </div>
                  {pasos.length > 2 && (
                    <button type="button" onClick={() => eliminarPaso(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-light)', fontSize: '18px', marginTop: '12px' }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={agregarPaso} style={{ marginTop: '16px', background: 'none', border: 'none', fontSize: '11px', fontWeight: 500, color: 'var(--fg)', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: 0 }}>
              + Agregar paso
            </button>
          </div>

          {error && <p style={{ fontSize: '13px', color: 'var(--red)' }}>— {error}</p>}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
            <button type="submit" disabled={loading} style={{
              padding: '16px 40px', background: loading ? 'var(--fg-light)' : 'var(--fg)',
              color: 'var(--white)', border: 'none', fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s'
            }}>
              {loading ? 'Publicando...' : 'Publicar receta — +50 puntos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}