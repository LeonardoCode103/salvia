'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Perfil = {
  nombre: string
  condicion_salud: string
}

const condicionLabels: Record<string, string> = {
  ninguna: 'Sin condición especial',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  colesterol: 'Colesterol alto',
  enfermedad_celiaca: 'Enfermedad celíaca',
  otro: 'Otra condición'
}

const condicionColores: Record<string, string> = {
  ninguna: 'bg-green-50 text-green-700 border-green-200',
  diabetes: 'bg-blue-50 text-blue-700 border-blue-200',
  hipertension: 'bg-red-50 text-red-700 border-red-200',
  colesterol: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  enfermedad_celiaca: 'bg-purple-50 text-purple-700 border-purple-200',
  otro: 'bg-gray-50 text-gray-700 border-gray-200'
}

export default function DashboardPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarPerfil = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Intenta leer el perfil
      const { data, error } = await supabase
        .from('perfiles')
        .select('nombre, condicion_salud')
        .eq('id', user.id)
        .single()

      if (data) {
        setPerfil(data)
        setNombre(data.nombre)
      } else {
        // Si no hay perfil, usa el metadata del usuario
        const meta = user.user_metadata
        if (meta?.nombre) {
          setNombre(meta.nombre)
          setPerfil({
            nombre: meta.nombre,
            condicion_salud: meta.condicion_salud ?? 'ninguna'
          })
          // Crea el perfil si no existe
          await supabase.from('perfiles').upsert({
            id: user.id,
            nombre: meta.nombre,
            condicion_salud: meta.condicion_salud ?? 'ninguna'
          })
        } else {
          setNombre('cocinero')
        }
      }
      setLoading(false)
    }
    cargarPerfil()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ color: '#9ca3af', fontSize: '14px' }}>Cargando tu perfil...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Georgia, serif' }}>

      {/* Navbar */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#2d6a4f' }}>🌿 Sazonia</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: '13px', color: '#9ca3af' }}>Tu recetario inteligente</span>
        </div>
        <button
          onClick={handleLogout}
          style={{ fontSize: '13px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Georgia, serif' }}
        >
          Cerrar sesión
        </button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Saludo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
            ¡Hola, {nombre}! 👋
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            ¿Qué quieres cocinar hoy?
          </p>
          {perfil?.condicion_salud && perfil.condicion_salud !== 'ninguna' && (
            <span style={{
              display: 'inline-block', marginTop: '10px', fontSize: '12px',
              fontWeight: '600', padding: '4px 12px', borderRadius: '20px',
              background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0'
            }}>
              🏥 {condicionLabels[perfil.condicion_salud]}
            </span>
          )}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { emoji: '🤖', titulo: 'IA con ingredientes', desc: 'Dime qué tienes en tu cocina y te digo qué cocinar', ruta: '/ia-ingredientes' },
            { emoji: '🍳', titulo: 'Explorar recetas', desc: 'Descubre recetas de la comunidad adaptadas a tu salud', ruta: '/recetas' },
            { emoji: '✍️', titulo: 'Publicar receta', desc: 'Comparte tus recetas y gana puntos de la comunidad', ruta: '/recetas/nueva' },
          ].map(card => (
            <button
              key={card.ruta}
              onClick={() => router.push(card.ruta)}
              style={{
                background: '#fff', border: '1px solid #f0f0f0', borderRadius: '16px',
                padding: '24px', textAlign: 'left', cursor: 'pointer', fontFamily: 'Georgia, serif',
                transition: 'all .2s', boxShadow: 'none'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#bbf7d0'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#f0f0f0'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.emoji}</div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 6px' }}>{card.titulo}</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>{card.desc}</p>
            </button>
          ))}
        </div>

        {/* Banner IA */}
        <div style={{
          background: 'linear-gradient(135deg, #1a4731 0%, #40916c 100%)',
          borderRadius: '16px', padding: '24px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>
              ¿Qué hay en tu cocina hoy?
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              Escribe tus ingredientes y nuestra IA genera recetas personalizadas para ti
            </p>
          </div>
          <button
            onClick={() => router.push('/ia-ingredientes')}
            style={{
              background: '#fff', color: '#2d6a4f', fontWeight: '600', fontSize: '14px',
              padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'Georgia, serif', whiteSpace: 'nowrap'
            }}
          >
            Probar ahora →
          </button>
        </div>
      </div>
    </div>
  )
}