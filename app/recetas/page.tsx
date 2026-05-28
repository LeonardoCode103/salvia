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
  {
    id: 'ej1',
    titulo: 'Caldo de pollo con verduras',
    descripcion: 'Un caldo reconfortante, bajo en sodio y perfecto para personas con hipertensión.',
    tiempo_minutos: 45, porciones: 4,
    condiciones_aptas: ['hipertension', 'diabetes', 'ninguna'],
    likes_count: 24, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['1 pechuga de pollo', '2 zanahorias', '2 papas', '1 cebolla', 'Cilantro', 'Sal sin sodio'],
    pasos: ['Pon a hervir el pollo con agua y cebolla por 20 min.', 'Agrega las verduras y cocina 20 min más.', 'Sazona y sirve con cilantro fresco.']
  },
  {
    id: 'ej2',
    titulo: 'Ensalada de atún con aguacate',
    descripcion: 'Rica en omega-3 y grasas saludables. Ideal para controlar el colesterol.',
    tiempo_minutos: 10, porciones: 2,
    condiciones_aptas: ['colesterol', 'diabetes', 'ninguna'],
    likes_count: 18, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['1 lata de atún en agua', '1 aguacate', '1 jitomate', '1/2 cebolla', 'Limón', 'Sal y pimienta'],
    pasos: ['Escurre el atún y mezcla con el aguacate aplastado.', 'Agrega jitomate y cebolla picados.', 'Sazona con limón, sal y pimienta.']
  },
  {
    id: 'ej3',
    titulo: 'Avena con fruta y canela',
    descripcion: 'Desayuno perfecto para diabéticos. Bajo índice glucémico y muy saciante.',
    tiempo_minutos: 10, porciones: 1,
    condiciones_aptas: ['diabetes', 'colesterol', 'ninguna'],
    likes_count: 31, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['1/2 taza de avena', '1 taza de agua o leche descremada', '1 manzana', 'Canela al gusto', 'Stevia (opcional)'],
    pasos: ['Hierve la avena en agua o leche por 5 minutos.', 'Agrega la manzana en cubos y canela.', 'Endulza con stevia si gustas y sirve caliente.']
  },
  {
    id: 'ej4',
    titulo: 'Tortillas de nopal con frijoles',
    descripcion: 'Alta en fibra y proteína vegetal. Perfecta para diabetes y sin gluten.',
    tiempo_minutos: 20, porciones: 2,
    condiciones_aptas: ['diabetes', 'enfermedad_celiaca', 'ninguna'],
    likes_count: 15, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['2 nopales medianos', '1 taza de frijoles negros cocidos', '1/2 cebolla', 'Chile serrano', 'Cilantro', 'Limón'],
    pasos: ['Asa los nopales en comal hasta que estén tiernos.', 'Calienta los frijoles con cebolla y chile.', 'Sirve los frijoles sobre los nopales con cilantro y limón.']
  },
  {
    id: 'ej5',
    titulo: 'Smoothie verde antioxidante',
    descripcion: 'Licuado detox perfecto para comenzar el día. Sin azúcar añadida.',
    tiempo_minutos: 5, porciones: 1,
    condiciones_aptas: ['ninguna', 'diabetes', 'hipertension', 'colesterol'],
    likes_count: 42, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['1 taza de espinacas', '1 pepino', '1 manzana verde', 'Jugo de 1 limón', '1 cm de jengibre', '1 taza de agua'],
    pasos: ['Lava bien todos los ingredientes.', 'Licúa todo junto hasta obtener una mezcla homogénea.', 'Sirve inmediatamente sin colar para aprovechar la fibra.']
  },
  {
    id: 'ej6',
    titulo: 'Pollo al horno con hierbas',
    descripcion: 'Proteína magra sin grasa añadida. Apto para todas las condiciones.',
    tiempo_minutos: 40, porciones: 3,
    condiciones_aptas: ['ninguna', 'diabetes', 'hipertension', 'colesterol', 'enfermedad_celiaca'],
    likes_count: 28, created_at: new Date().toISOString(), autor_id: '',
    ingredientes: ['3 pechugas de pollo', 'Ajo en polvo', 'Orégano', 'Tomillo', 'Limón', 'Aceite de oliva', 'Sal y pimienta'],
    pasos: ['Marina el pollo con limón, ajo, orégano y tomillo por 15 min.', 'Hornea a 180°C por 25-30 minutos.', 'Sirve con ensalada verde o verduras al vapor.']
  }
]

const condicionLabels: Record<string, { label: string, color: string, bg: string }> = {
  ninguna: { label: 'General', color: '#166534', bg: '#f0fdf4' },
  diabetes: { label: 'Diabetes', color: '#1d4ed8', bg: '#eff6ff' },
  hipertension: { label: 'Hipertensión', color: '#991b1b', bg: '#fef2f2' },
  colesterol: { label: 'Colesterol', color: '#92400e', bg: '#fffbeb' },
  enfermedad_celiaca: { label: 'Sin gluten', color: '#6b21a8', bg: '#faf5ff' },
  otro: { label: 'Otra', color: '#374151', bg: '#f9fafb' }
}

const filtros = [
  { value: 'todas', label: '🍽️ Todas' },
  { value: 'ninguna', label: '😋 General' },
  { value: 'diabetes', label: '🩸 Diabetes' },
  { value: 'hipertension', label: '❤️ Hipertensión' },
  { value: 'colesterol', label: '🫀 Colesterol' },
  { value: 'enfermedad_celiaca', label: '🌾 Sin gluten' },
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
    const cargarRecetas = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('recetas')
        .select('*')
        .order('created_at', { ascending: false })

      const recetasDB = data || []
      const titulosDB = recetasDB.map((r: Receta) => r.titulo)
      const ejemplosFiltrados = recetasEjemplo.filter(ej => !titulosDB.includes(ej.titulo))
      const combinadas = [...recetasDB, ...ejemplosFiltrados]

      setTodasRecetas(combinadas)
      setLikeCounts(Object.fromEntries(combinadas.map(r => [r.id, r.likes_count || 0])))
      setCargando(false)
    }
    cargarRecetas()
  }, [])

  const recetasFiltradas = filtro === 'todas'
    ? todasRecetas
    : todasRecetas.filter(r => r.condiciones_aptas?.includes(filtro))

  const handleLike = (id: string) => {
    setLikes(prev => {
      const yaLiked = prev[id]
      setLikeCounts(counts => ({
        ...counts,
        [id]: yaLiked ? counts[id] - 1 : counts[id] + 1
      }))
      return { ...prev, [id]: !yaLiked }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Georgia, serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={() => router.push('/dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
        }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#2d6a4f' }}>🌿 Sazonia</span>
        </button>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/recetas/nueva')}
            style={{
              fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #1a4731, #40916c)',
              color: '#fff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: '600'
            }}
          >
            + Publicar receta
          </button>
          <button onClick={() => router.push('/dashboard')} style={{
            fontSize: '13px', color: '#6b7280', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif'
          }}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
            Explorar recetas 🍳
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {cargando ? 'Cargando...' : `${recetasFiltradas.length} recetas ${filtro !== 'todas' ? `para ${condicionLabels[filtro]?.label}` : 'de la comunidad'}`}
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {filtros.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              style={{
                padding: '8px 16px', borderRadius: '20px', fontSize: '13px',
                border: filtro === f.value ? '2px solid #2d6a4f' : '1.5px solid #e5e7eb',
                background: filtro === f.value ? '#f0fdf4' : '#fff',
                color: filtro === f.value ? '#1a4731' : '#4b5563',
                cursor: 'pointer', fontFamily: 'Georgia, serif',
                fontWeight: filtro === f.value ? '600' : '400',
                transition: 'all .15s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '14px' }}>
            🔄 Cargando recetas...
          </div>
        ) : recetasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', color: '#374151', margin: '0 0 8px' }}>
              No hay recetas para este filtro aún
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              ¡Sé el primero en publicar una receta para esta condición!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recetasFiltradas.map(receta => (
              <div key={receta.id} style={{
                background: '#fff', borderRadius: '16px',
                border: recetaAbierta === receta.id ? '2px solid #2d6a4f' : '1px solid #f0f0f0',
                overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all .2s'
              }}>
                {/* Card header */}
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                          {receta.titulo}
                        </h3>
                        {receta.condiciones_aptas?.filter(c => c !== 'ninguna').slice(0, 2).map(c => (
                          <span key={c} style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                            background: condicionLabels[c]?.bg,
                            color: condicionLabels[c]?.color, fontWeight: '600'
                          }}>
                            {condicionLabels[c]?.label}
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px', lineHeight: '1.5' }}>
                        {receta.descripcion}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>⏱️ {receta.tiempo_minutos} min</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>👥 {receta.porciones} porciones</span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>🥘 {receta.ingredientes?.length} ingredientes</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleLike(receta.id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', gap: '2px' }}
                      >
                        <span style={{ fontSize: '20px' }}>{likes[receta.id] ? '❤️' : '🤍'}</span>
                        <span style={{ fontSize: '11px', color: likes[receta.id] ? '#dc2626' : '#9ca3af', fontWeight: '600' }}>
                          {likeCounts[receta.id] || 0}
                        </span>
                      </button>
                      <button
                        onClick={() => setRecetaAbierta(recetaAbierta === receta.id ? null : receta.id)}
                        style={{
                          fontSize: '12px', padding: '6px 14px', borderRadius: '8px',
                          border: '1px solid #e5e7eb', background: '#f9fafb',
                          color: '#4b5563', cursor: 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap'
                        }}
                      >
                        {recetaAbierta === receta.id ? 'Cerrar' : 'Ver receta'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalle expandido */}
                {recetaAbierta === receta.id && (
                  <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f9fafb' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 10px' }}>
                          🛒 Ingredientes
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {receta.ingredientes?.map((ing, i) => (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              fontSize: '13px', color: '#4b5563', padding: '6px 10px',
                              background: '#f9fafb', borderRadius: '8px'
                            }}>
                              <span style={{ color: '#2d6a4f', fontWeight: '600' }}>•</span>{ing}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', margin: '0 0 10px' }}>
                          👨‍🍳 Preparación
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {receta.pasos?.map((paso, i) => (
                            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <span style={{
                                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #1a4731, #40916c)',
                                color: '#fff', fontSize: '11px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>{i + 1}</span>
                              <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.6' }}>{paso}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}