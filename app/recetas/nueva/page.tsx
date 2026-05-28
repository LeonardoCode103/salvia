'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const condicionesOpciones = [
  { value: 'ninguna', label: 'General', emoji: '😋' },
  { value: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { value: 'hipertension', label: 'Hipertensión', emoji: '❤️' },
  { value: 'colesterol', label: 'Colesterol alto', emoji: '🫀' },
  { value: 'enfermedad_celiaca', label: 'Sin gluten', emoji: '🌾' },
  { value: 'otro', label: 'Otra condición', emoji: '🏥' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: '10px', fontSize: '14px', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
  fontFamily: 'Georgia, serif', color: '#111827',
  WebkitTextFillColor: '#111827',
}

export default function NuevaRecetaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [focused, setFocused] = useState('')

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tiempoMinutos, setTiempoMinutos] = useState('')
  const [porciones, setPorciones] = useState('')
  const [condicionesAptas, setCondicionesAptas] = useState<string[]>(['ninguna'])
  const [ingredientes, setIngredientes] = useState(['', '', ''])
  const [pasos, setPasos] = useState(['', '', ''])

  const toggleCondicion = (val: string) => {
    setCondicionesAptas(prev =>
      prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val]
    )
  }

  const updateIngrediente = (i: number, val: string) => {
    const nuevo = [...ingredientes]
    nuevo[i] = val
    setIngredientes(nuevo)
  }

  const updatePaso = (i: number, val: string) => {
    const nuevo = [...pasos]
    nuevo[i] = val
    setPasos(nuevo)
  }

  const agregarIngrediente = () => setIngredientes([...ingredientes, ''])
  const agregarPaso = () => setPasos([...pasos, ''])

  const eliminarIngrediente = (i: number) => {
    if (ingredientes.length <= 2) return
    setIngredientes(ingredientes.filter((_, idx) => idx !== i))
  }

  const eliminarPaso = (i: number) => {
    if (pasos.length <= 2) return
    setPasos(pasos.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const ingredientesFiltrados = ingredientes.filter(i => i.trim())
    const pasosFiltrados = pasos.filter(p => p.trim())

    if (!titulo.trim() || titulo.length < 5) { setError('El título debe tener al menos 5 caracteres'); return }
    if (!descripcion.trim() || descripcion.length < 20) { setError('La descripción debe tener al menos 20 caracteres'); return }
    if (!tiempoMinutos || parseInt(tiempoMinutos) < 1) { setError('Agrega el tiempo de preparación'); return }
    if (!porciones || parseInt(porciones) < 1) { setError('Agrega el número de porciones'); return }
    if (ingredientesFiltrados.length < 2) { setError('Agrega al menos 2 ingredientes'); return }
    if (pasosFiltrados.length < 2) { setError('Agrega al menos 2 pasos de preparación'); return }
    if (condicionesAptas.length === 0) { setError('Selecciona al menos una condición de salud'); return }

    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/login'); return }

    const { error: dbError } = await supabase.from('recetas').insert({
      autor_id: user.id,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tiempo_minutos: parseInt(tiempoMinutos),
      porciones: parseInt(porciones),
      ingredientes: ingredientesFiltrados,
      pasos: pasosFiltrados,
      condiciones_aptas: condicionesAptas,
      likes_count: 0
    })

    if (dbError) {
      console.error('Error detallado:', dbError)
      setError(`Error: ${dbError.message}`)
      setLoading(false)
      return
    }

    // Dar puntos por publicar receta
    await supabase.from('puntos').insert({
      user_id: user.id,
      cantidad: 50,
      motivo: 'Publicó una receta'
    })

    setExito(true)
    setLoading(false)
  }

  if (exito) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a4731', margin: '0 0 12px' }}>
            ¡Receta publicada!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
            Tu receta ya está visible para la comunidad de Sazonia.
          </p>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '12px', padding: '14px', marginBottom: '28px',
            fontSize: '14px', color: '#166534', fontWeight: '600'
          }}>
            🏆 +50 puntos ganados por compartir tu receta
          </div>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={() => router.push('/recetas')}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #1a4731, #40916c)',
                color: '#fff', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}
            >
              Ver todas las recetas
            </button>
            <button
              onClick={() => { setExito(false); setTitulo(''); setDescripcion(''); setTiempoMinutos(''); setPorciones(''); setIngredientes(['', '', '']); setPasos(['', '', '']); setCondicionesAptas(['ninguna']) }}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px',
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#374151', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Georgia, serif'
              }}
            >
              Publicar otra receta
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus,
        textarea:-webkit-autofill, textarea:-webkit-autofill:hover, textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: #111827 !important;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
        }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Georgia, serif' }}>

        {/* Navbar */}
        <nav style={{
          background: '#fff', borderBottom: '1px solid #f0f0f0',
          padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10
        }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#2d6a4f' }}>🌿 Sazonia</span>
          <button onClick={() => router.push('/recetas')} style={{
            fontSize: '13px', color: '#6b7280', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
          }}>
            ← Volver a recetas
          </button>
        </nav>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '36px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
              Publicar receta ✍️
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Comparte tu receta con la comunidad y gana <strong style={{ color: '#1a4731' }}>+50 puntos</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Título */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Nombre de la receta *
              </label>
              <input
                type="text"
                placeholder="Ej: Caldo de pollo con verduras"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                onFocus={() => setFocused('titulo')}
                onBlur={() => setFocused('')}
                maxLength={100}
                style={{
                  ...inputStyle,
                  borderColor: focused === 'titulo' ? '#2d6a4f' : '#e5e7eb',
                  boxShadow: focused === 'titulo' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' }}>
                {titulo.length}/100
              </p>
            </div>

            {/* Descripción */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Descripción breve *
              </label>
              <textarea
                placeholder="Describe tu receta en pocas palabras. ¿Por qué es especial? ¿Para qué condición es ideal?"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                maxLength={500}
                onFocus={() => setFocused('desc')}
                onBlur={() => setFocused('')}
                style={{
                  ...inputStyle,
                  resize: 'vertical', lineHeight: '1.6',
                  borderColor: focused === 'desc' ? '#2d6a4f' : '#e5e7eb',
                  boxShadow: focused === 'desc' ? '0 0 0 3px rgba(45,106,79,0.1)' : 'none'
                }}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' }}>
                {descripcion.length}/500
              </p>
            </div>

            {/* Tiempo y porciones */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    ⏱️ Tiempo de preparación *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="30"
                      value={tiempoMinutos}
                      onChange={e => setTiempoMinutos(e.target.value)}
                      min="1" max="480"
                      onFocus={() => setFocused('tiempo')}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle, width: '100px',
                        borderColor: focused === 'tiempo' ? '#2d6a4f' : '#e5e7eb',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>minutos</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    👥 Porciones *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="4"
                      value={porciones}
                      onChange={e => setPorciones(e.target.value)}
                      min="1" max="20"
                      onFocus={() => setFocused('porciones')}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle, width: '100px',
                        borderColor: focused === 'porciones' ? '#2d6a4f' : '#e5e7eb',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>personas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condiciones aptas */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                🏥 ¿Para qué condiciones de salud es apta? *
              </label>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                Puedes seleccionar varias
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {condicionesOpciones.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => toggleCondicion(c.value)}
                    style={{
                      padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                      border: condicionesAptas.includes(c.value) ? '2px solid #2d6a4f' : '1.5px solid #e5e7eb',
                      background: condicionesAptas.includes(c.value) ? '#f0fdf4' : '#fff',
                      color: condicionesAptas.includes(c.value) ? '#1a4731' : '#4b5563',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'Georgia, serif',
                      fontWeight: condicionesAptas.includes(c.value) ? '600' : '400',
                      transition: 'all .15s'
                    }}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredientes */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                🛒 Ingredientes *
              </label>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                Un ingrediente por línea con cantidad. Ej: "2 tazas de arroz"
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ingredientes.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                      background: '#f0fdf4', color: '#2d6a4f', fontSize: '11px',
                      fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Ingrediente ${i + 1}`}
                      value={ing}
                      onChange={e => updateIngrediente(i, e.target.value)}
                      onFocus={() => setFocused(`ing${i}`)}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle, flex: 1,
                        borderColor: focused === `ing${i}` ? '#2d6a4f' : '#e5e7eb',
                      }}
                    />
                    {ingredientes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => eliminarIngrediente(i)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                          background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                          fontSize: '14px', flexShrink: 0, display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={agregarIngrediente}
                style={{
                  marginTop: '10px', fontSize: '13px', color: '#2d6a4f',
                  background: 'none', border: '1.5px dashed #2d6a4f',
                  borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif', width: '100%'
                }}
              >
                + Agregar ingrediente
              </button>
            </div>

            {/* Pasos */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #f0f0f0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                👨‍🍳 Pasos de preparación *
              </label>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
                Describe cada paso con detalle para que no haya fallas
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pasos.map((paso, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1a4731, #40916c)',
                      color: '#fff', fontSize: '11px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '10px'
                    }}>
                      {i + 1}
                    </span>
                    <textarea
                      placeholder={`Describe el paso ${i + 1} con detalle...`}
                      value={paso}
                      onChange={e => updatePaso(i, e.target.value)}
                      rows={2}
                      onFocus={() => setFocused(`paso${i}`)}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle, flex: 1, resize: 'vertical', lineHeight: '1.6',
                        borderColor: focused === `paso${i}` ? '#2d6a4f' : '#e5e7eb',
                      }}
                    />
                    {pasos.length > 2 && (
                      <button
                        type="button"
                        onClick={() => eliminarPaso(i)}
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                          background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                          fontSize: '14px', flexShrink: 0, marginTop: '8px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={agregarPaso}
                style={{
                  marginTop: '10px', fontSize: '13px', color: '#2d6a4f',
                  background: 'none', border: '1.5px dashed #2d6a4f',
                  borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
                  fontFamily: 'Georgia, serif', width: '100%'
                }}
              >
                + Agregar paso
              </button>
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
                width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
                background: loading ? '#86efac' : 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
                color: '#fff', fontSize: '16px', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Georgia, serif', letterSpacing: '0.3px'
              }}
            >
              {loading ? 'Publicando...' : '🚀 Publicar receta y ganar +50 puntos'}
            </button>

          </form>
        </div>
      </div>
    </>
  )
}