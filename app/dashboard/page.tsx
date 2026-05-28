'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Perfil = { nombre: string; condicion_salud: string }

const condicionLabels: Record<string, string> = {
  ninguna: 'Sin restricciones',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  colesterol: 'Colesterol alto',
  enfermedad_celiaca: 'Celiaquía',
  otro: 'Otra condición'
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
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('perfiles').select('nombre, condicion_salud').eq('id', user.id).single()
      if (data) { setPerfil(data); setNombre(data.nombre) }
      else {
        const meta = user.user_metadata
        if (meta?.nombre) {
          setNombre(meta.nombre)
          setPerfil({ nombre: meta.nombre, condicion_salud: meta.condicion_salud ?? 'ninguna' })
          await supabase.from('perfiles').upsert({ id: user.id, nombre: meta.nombre, condicion_salud: meta.condicion_salud ?? 'ninguna' })
        } else setNombre('Chef')
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ fontSize: '12px', color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--border)', padding: '20px 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Sazonia
        </p>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recetas</button>
          <button onClick={() => router.push('/ia-ingredientes')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>IA</button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Salir</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 48px 64px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            {perfil?.condicion_salud && perfil.condicion_salud !== 'ninguna'
              ? condicionLabels[perfil.condicion_salud]
              : 'Bienvenido de vuelta'}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(56px, 7vw, 96px)',
            fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0,
            letterSpacing: '-0.03em', marginBottom: '32px'
          }}>
            Hola,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>{nombre}.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--fg-muted)', maxWidth: '480px', lineHeight: 1.7, fontWeight: 300 }}>
            ¿Qué quieres cocinar hoy? Dinos qué tienes en casa o explora las recetas de la comunidad.
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '0 48px' }}>
        {[
          {
            num: '01', titulo: 'IA con ingredientes',
            desc: 'Escribe lo que tienes en tu cocina y generamos recetas adaptadas a tu salud al instante.',
            cta: 'Generar recetas', ruta: '/ia-ingredientes',
            bg: 'var(--bg-dark)', color: 'var(--white)', goldNum: true
          },
          {
            num: '02', titulo: 'Explorar recetas',
            desc: 'Descubre recetas de la comunidad, filtradas por tu condición de salud.',
            cta: 'Ver recetas', ruta: '/recetas',
            bg: 'var(--surface)', color: 'var(--fg)', goldNum: false
          },
          {
            num: '03', titulo: 'Publicar receta',
            desc: 'Comparte tu receta favorita y gana 50 puntos de la comunidad.',
            cta: 'Publicar', ruta: '/recetas/nueva',
            bg: 'var(--bg)', color: 'var(--fg)', goldNum: false
          },
        ].map(card => (
          <div
            key={card.num}
            style={{
              background: card.bg, padding: '48px 40px',
              borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '320px', cursor: 'pointer', transition: 'opacity .2s'
            }}
            onClick={() => router.push(card.ruta)}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: card.goldNum ? 'var(--gold)' : 'var(--fg-light)', marginBottom: '32px', letterSpacing: '0.1em' }}>
                {card.num}
              </p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: card.color, lineHeight: 1.2, marginBottom: '16px' }}>
                {card.titulo}
              </h3>
              <p style={{ fontSize: '13px', color: card.goldNum ? 'rgba(255,255,255,0.5)' : 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                {card.desc}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: card.goldNum ? 'var(--gold)' : 'var(--fg)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {card.cta}
              </p>
              <span style={{ color: card.goldNum ? 'var(--gold)' : 'var(--fg)', fontSize: '16px' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}