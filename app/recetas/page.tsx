'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'
import BotonCompartir from '@/app/components/BotonCompartir'
import Comentarios from '@/app/components/Comentarios'
import ModoCocinar from '@/app/components/ModoCocinar'

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

const filtrosCondicion = [
  { value: 'todas', label: 'Todas' },
  { value: 'ninguna', label: 'General' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hipertension', label: 'Hipertensión' },
  { value: 'colesterol', label: 'Colesterol' },
  { value: 'enfermedad_celiaca', label: 'Sin gluten' },
]

const filtrosTiempo = [
  { value: 0, label: 'Cualquier tiempo' },
  { value: 15, label: '≤15 min' },
  { value: 30, label: '≤30 min' },
  { value: 60, label: '≤1 hora' },
]

const ordenes = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'populares', label: 'Más populares' },
  { value: 'rapidas', label: 'Más rápidas' },
]

export default function RecetasPage() {
  const router = useRouter()
  const [filtro, setFiltro] = useState('todas')
  const [maxTiempo, setMaxTiempo] = useState(0)
  const [orden, setOrden] = useState('recientes')
  const [busqueda, setBusqueda] = useState('')
  const [recetaAbierta, setRecetaAbierta] = useState<string | null>(null)
  const [misLikes, setMisLikes] = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [todasRecetas, setTodasRecetas] = useState<Receta[]>([])
  const [cargando, setCargando] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [usandoLikesDB, setUsandoLikesDB] = useState(true)
  const [cocinarReceta, setCocinarReceta] = useState<Receta | null>(null)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data } = await supabase.from('recetas').select('*').order('created_at', { ascending: false })
      const recetasDB = data || []
      const titulosDB = recetasDB.map((r: Receta) => r.titulo)
      const combinadas = [...recetasDB, ...recetasEjemplo.filter(ej => !titulosDB.includes(ej.titulo))]
      setTodasRecetas(combinadas)
      setLikeCounts(Object.fromEntries(combinadas.map(r => [r.id, r.likes_count || 0])))

      // Cargar mis likes
      if (user) {
        const { data: misLikesData, error } = await supabase
          .from('likes')
          .select('receta_id')
          .eq('user_id', user.id)
        if (!error && misLikesData) {
          setMisLikes(new Set(misLikesData.map((l: { receta_id: string }) => l.receta_id)))
        } else {
          setUsandoLikesDB(false)
          try {
            const local = JSON.parse(localStorage.getItem('salvia_mis_likes') ?? '[]')
            setMisLikes(new Set(local))
          } catch {}
        }
      }

      setCargando(false)
    }
    cargar()
  }, [])

  const recetasFiltradas = useMemo(() => {
    let lista = todasRecetas
    if (filtro !== 'todas') lista = lista.filter(r => r.condiciones_aptas?.includes(filtro))
    if (maxTiempo > 0) lista = lista.filter(r => r.tiempo_minutos <= maxTiempo)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      lista = lista.filter(r =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.ingredientes?.some(ing => ing.toLowerCase().includes(q))
      )
    }
    if (orden === 'populares') lista = [...lista].sort((a, b) => (likeCounts[b.id] || 0) - (likeCounts[a.id] || 0))
    else if (orden === 'rapidas') lista = [...lista].sort((a, b) => a.tiempo_minutos - b.tiempo_minutos)
    return lista
  }, [todasRecetas, filtro, maxTiempo, busqueda, orden, likeCounts])

  const handleLike = async (id: string) => {
    if (!userId) { router.push('/login'); return }
    const yaLiked = misLikes.has(id)
    const nueva = new Set(misLikes)
    if (yaLiked) nueva.delete(id); else nueva.add(id)
    setMisLikes(nueva)
    setLikeCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + (yaLiked ? -1 : 1) }))

    if (usandoLikesDB) {
      const supabase = createClient()
      if (yaLiked) {
        await supabase.from('likes').delete().match({ user_id: userId, receta_id: id })
      } else {
        const { error } = await supabase.from('likes').insert({ user_id: userId, receta_id: id })
        if (error) setUsandoLikesDB(false)
      }
    } else {
      localStorage.setItem('salvia_mis_likes', JSON.stringify([...nueva]))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {cocinarReceta && (
        <ModoCocinar
          nombre={cocinarReceta.titulo}
          pasos={cocinarReceta.pasos}
          ingredientes={cocinarReceta.ingredientes}
          onCerrar={() => setCocinarReceta(null)}
        />
      )}

      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </button>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas/nueva')} style={{ background: 'var(--fg)', border: 'none', color: 'var(--white)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '10px 16px', cursor: 'pointer' }}>
            Publicar
          </button>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Inicio
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="page-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Comunidad
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              Explorar<br /><em style={{ fontStyle: 'italic' }}>recetas.</em>
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '280px', lineHeight: 1.7, fontWeight: 300 }}>
            {cargando ? 'Cargando...' : `${recetasFiltradas.length} ${recetasFiltradas.length === 1 ? 'receta' : 'recetas'}`}
          </p>
        </div>

        {/* Buscador */}
        <div style={{ borderBottom: '1.5px solid var(--fg)', display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', maxWidth: '600px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5" stroke="var(--fg-light)" strokeWidth="1.5"/>
            <line x1="11" y1="11" x2="14" y2="14" stroke="var(--fg-light)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, ingrediente, descripción..."
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: 'var(--fg)', outline: 'none', fontFamily: 'var(--font-body)' }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Toggle filtros avanzados */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase', padding: 0 }}
          >
            {filtrosAbiertos ? '− Filtros' : '+ Filtros avanzados'}
          </button>
          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            style={{ background: 'transparent', border: 'none', fontSize: '11px', color: 'var(--fg)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}
          >
            {ordenes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {filtrosAbiertos && (
          <div style={{ marginTop: '20px', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Tiempo</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filtrosTiempo.map(t => (
                <button
                  key={t.value}
                  onClick={() => setMaxTiempo(t.value)}
                  style={{
                    padding: '8px 14px', border: '1px solid var(--border)',
                    background: maxTiempo === t.value ? 'var(--fg)' : 'transparent',
                    color: maxTiempo === t.value ? 'var(--white)' : 'var(--fg-muted)',
                    fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filtros condición */}
      <div className="filtros-bar">
        {filtrosCondicion.map((f, i) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            style={{
              padding: '10px 20px', border: '1px solid var(--border)',
              borderLeft: i === 0 ? '1px solid var(--border)' : 'none',
              background: filtro === f.value ? 'var(--fg)' : 'transparent',
              color: filtro === f.value ? 'var(--white)' : 'var(--fg-muted)',
              fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em',
              textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recetas */}
      <div className="page-body">
        {cargando ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Cargando recetas...</p>
          </div>
        ) : recetasFiltradas.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: '12px' }}>Sin resultados.</p>
            <p style={{ fontSize: '13px', color: 'var(--fg-light)' }}>Prueba quitar filtros o buscar otro término.</p>
          </div>
        ) : (
          recetasFiltradas.map((receta, i) => (
            <div key={receta.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '16px', alignItems: 'start' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px', letterSpacing: '0.05em' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.tiempo_minutos} min</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.porciones} porciones</span>
                      <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.ingredientes?.length} ingredientes</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '4px' }}>
                  <button onClick={() => handleLike(receta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '18px', color: misLikes.has(receta.id) ? 'var(--accent-light)' : 'var(--fg-light)', transition: 'color .15s' }}>
                      {misLikes.has(receta.id) ? '♥' : '♡'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--fg-light)', letterSpacing: '0.1em' }}>{likeCounts[receta.id] || 0}</span>
                  </button>
                  <button
                    onClick={() => setRecetaAbierta(recetaAbierta === receta.id ? null : receta.id)}
                    style={{ background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg)', transition: 'all .15s', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
                  >
                    {recetaAbierta === receta.id ? 'Cerrar' : 'Ver'}
                  </button>
                </div>
              </div>

              {recetaAbierta === receta.id && (
                <>
                  <div className="recipe-expand">
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
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-light)', lineHeight: 1, minWidth: '28px', fontWeight: 300 }}>{j + 1}</span>
                            <p style={{ fontSize: '14px', color: 'var(--fg)', margin: 0, lineHeight: 1.7, fontWeight: 300 }}>{paso}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => setCocinarReceta(receta)}
                          style={{ padding: '12px 20px', background: 'var(--bg-dark)', color: 'var(--white)', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          ▶ Modo cocinar
                        </button>
                        <BotonCompartir receta={{ nombre: receta.titulo, descripcion: receta.descripcion, ingredientes: receta.ingredientes, pasos: receta.pasos }} />
                      </div>

                      <Comentarios recetaId={receta.id} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
