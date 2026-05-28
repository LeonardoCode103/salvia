'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Receta = {
  id: string
  titulo: string
  descripcion: string
  tiempo_minutos: number
  porciones: number
  condiciones_aptas: string[]
  likes_count: number
  created_at: string
  autor_id: string
  ingredientes: string[]
  pasos: string[]
}

const recetasEjemplo: Receta[] = [
  { id: 'ej1', titulo: 'Caldo de pollo con verduras', descripcion: 'Caldo reconfortante, bajo en sodio. Perfecto para hipertensión.', tiempo_minutos: 45, porciones: 4, condiciones_aptas: ['hipertension', 'diabetes', 'ninguna'], likes_count: 24, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['1 pechuga de pollo', '2 zanahorias', '2 papas', '1 cebolla', 'Cilantro fresco', 'Sal sin sodio'], pasos: ['Hierve el pollo con cebolla por 20 min.', 'Agrega las verduras y cocina 20 min más.', 'Sazona y sirve con cilantro.'] },
  { id: 'ej2', titulo: 'Ensalada de atún con aguacate', descripcion: 'Rica en omega-3. Ideal para controlar el colesterol.', tiempo_minutos: 10, porciones: 2, condiciones_aptas: ['colesterol', 'diabetes', 'ninguna'], likes_count: 18, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['1 lata de atún en agua', '1 aguacate', '1 jitomate', 'Limón', 'Sal y pimienta'], pasos: ['Mezcla el atún con aguacate aplastado.', 'Agrega jitomate picado.', 'Sazona con limón y sal.'] },
  { id: 'ej3', titulo: 'Avena con fruta y canela', descripcion: 'Desayuno perfecto para diabéticos. Bajo índice glucémico.', tiempo_minutos: 10, porciones: 1, condiciones_aptas: ['diabetes', 'colesterol', 'ninguna'], likes_count: 31, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['1/2 taza de avena', '1 taza de leche descremada', '1 manzana', 'Canela', 'Stevia'], pasos: ['Hierve la avena en leche 5 min.', 'Agrega manzana en cubos y canela.', 'Endulza con stevia.'] },
  { id: 'ej4', titulo: 'Tortillas de nopal con frijoles', descripcion: 'Alta en fibra y proteína. Perfecta para diabetes y celiaquía.', tiempo_minutos: 20, porciones: 2, condiciones_aptas: ['diabetes', 'enfermedad_celiaca', 'ninguna'], likes_count: 15, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['2 nopales medianos', '1 taza de frijoles negros', 'Chile serrano', 'Cilantro', 'Limón'], pasos: ['Asa los nopales en comal.', 'Calienta los frijoles con chile.', 'Sirve sobre los nopales.'] },
  { id: 'ej5', titulo: 'Licuado verde sin azúcar', descripcion: 'Detox perfecto para el día. Sin azúcar añadida.', tiempo_minutos: 5, porciones: 1, condiciones_aptas: ['ninguna', 'diabetes', 'hipertension', 'colesterol'], likes_count: 42, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['1 taza de espinacas', '1 pepino', '1 manzana verde', 'Limón', 'Jengibre'], pasos: ['Lava los ingredientes.', 'Licúa todo hasta homogéneo.', 'Sirve sin colar.'] },
  { id: 'ej6', titulo: 'Pollo al horno con hierbas', descripcion: 'Proteína magra sin grasa. Apto para todas las condiciones.', tiempo_minutos: 40, porciones: 3, condiciones_aptas: ['ninguna', 'diabetes', 'hipertension', 'colesterol', 'enfermedad_celiaca'], likes_count: 28, created_at: new Date().toISOString(), autor_id: '', ingredientes: ['3 pechugas de pollo', 'Ajo', 'Orégano', 'Tomillo', 'Limón', 'Aceite de oliva'], pasos: ['Marina el pollo con hierbas 15 min.', 'Hornea a 180°C por 30 min.', 'Sirve con ensalada verde.'] },
]

const condicionLabels: Record<string, string> = {
  ninguna: 'General', diabetes: 'Diabetes', hipertension: 'Hipertensión',
  colesterol: 'Colesterol', enfermedad_celiaca: 'Sin gluten', otro: 'Otro'
}

const filtros = [
  { value: 'todas', label: 'Todas' },
  { value: 'ninguna', label: 'General' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol', label: 'Colesterol' },
  { value: 'enfermedad_celiaca', label: 'Sin gluten' },
]

export default function RecetasPage() {
  const router = useRouter()
  const [filtro, setFiltro] = useState('todas')
  const [recetaAbierta, setRecetaAbierta] = useState<string | null>(null)
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [todasRecetas, setTodasRecetas] = useState<Receta[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('recetas').select('*').order('created_at', { ascending: false })
      const recetasDB = data || []
      const titulosDB = recetasDB.map((r: Receta) => r.titulo)
      const combinadas = [...recetasDB, ...recetasEjemplo.filter(ej => !titulosDB.includes(ej.titulo))]
      setTodasRecetas(combinadas)
      setLikeCounts(Object.fromEntries(combinadas.map(r => [r.id, r.likes_count || 0])))
      setCargando(false)
    }
    cargar()
  }, [])

  const recetasFiltradas = filtro === 'todas' ? todasRecetas : todasRecetas.filter(r => r.condiciones_aptas?.includes(filtro))

  const handleLike = (id: string) => {
    setLikes(prev => {
      const yaLiked = prev[id]
      setLikeCounts(counts => ({ ...counts, [id]: yaLiked ? counts[id] - 1 : counts[id] + 1 }))
      return { ...prev, [id]: !yaLiked }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Sazonia
        </button>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas/nueva')} style={{ background: 'var(--fg)', border: 'none', color: 'var(--white)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 20px', cursor: 'pointer' }}>
            Publicar receta
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Dashboard
          </button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: '64px 48px 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Comunidad
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              Explorar<br /><em style={{ fontStyle: 'italic' }}>recetas.</em>
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '280px', lineHeight: 1.7, fontWeight: 300 }}>
            {cargando ? 'Cargando...' : `${recetasFiltradas.length} recetas${filtro !== 'todas' ? ` para ${condicionLabels[filtro]}` : ' de la comunidad'}`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '24px 48px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0', overflowX: 'auto' }}>
        {filtros.map((f, i) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            style={{
              padding: '10px 20px', border: '1px solid var(--border)',
              borderLeft: i === 0 ? '1px solid var(--border)' : 'none',
              background: filtro === f.value ? 'var(--fg)' : 'transparent',
              color: filtro === f.value ? 'var(--white)' : 'var(--fg-muted)',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recetas */}
      <div style={{ padding: '0 48px 80px' }}>
        {cargando ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Cargando recetas...</p>
          </div>
        ) : recetasFiltradas.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: '12px' }}>Sin recetas aún.</p>
            <p style={{ fontSize: '13px', color: 'var(--fg-light)' }}>Sé el primero en publicar una receta para esta condición.</p>
          </div>
        ) : (
          recetasFiltradas.map((receta, i) => (
            <div key={receta.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '24px', alignItems: 'start' }}>
                  {/* Número */}
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px', letterSpacing: '0.05em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  {/* Contenido */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--fg)', margin: 0, letterSpacing: '-0.01em' }}>
                        {receta.titulo}
                      </h3>
                      {receta.condiciones_aptas?.filter(c => c !== 'ninguna').slice(0, 2).map(c => (
                        <span key={c} style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-light)', border: '1px solid var(--border)', padding: '3px 8px' }}>
                          {condicionLabels[c]}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 16px', lineHeight: 1.6, maxWidth: '560px', fontWeight: 300 }}>
                      {receta.descripcion}
                    </p>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.tiempo_minutos} min</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.porciones} porciones</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.ingredientes?.length} ingredientes</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingTop: '4px' }}>
                  <button onClick={() => handleLike(receta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '14px', color: likes[receta.id] ? 'var(--accent)' : 'var(--fg-light)' }}>
                      {likes[receta.id] ? '♥' : '♡'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--fg-light)', letterSpacing: '0.1em' }}>{likeCounts[receta.id] || 0}</span>
                  </button>
                  <button
                    onClick={() => setRecetaAbierta(recetaAbierta === receta.id ? null : receta.id)}
                    style={{ background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg)', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
                  >
                    {recetaAbierta === receta.id ? 'Cerrar' : 'Ver receta'}
                  </button>
                </div>
              </div>

              {/* Detalle expandido */}
              {recetaAbierta === receta.id && (
                <div style={{ padding: '0 0 40px 88px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Ingredientes</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {receta.ingredientes?.map((ing, j) => (
                        <div key={j} style={{ display: 'flex', gap: '16px', alignItems: 'baseline', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', minWidth: '24px' }}>{j + 1}</span>
                          <span style={{ fontSize: '14px', color: 'var(--fg)', fontWeight: 300 }}>{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '20px' }}>Preparación</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {receta.pasos?.map((paso, j) => (
                        <div key={j} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--fg-light)', lineHeight: 1, minWidth: '28px', fontWeight: 300 }}>{j + 1}</span>
                          <p style={{ fontSize: '14px', color: 'var(--fg)', margin: 0, lineHeight: 1.7, fontWeight: 300 }}>{paso}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}