'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'
import Onboarding from '@/app/components/Onboarding'

type Perfil = { nombre: string; condicion_salud: string }
type RecetaSorpresa = {
  nombre: string; tiempo: string; porciones: number; dificultad: string;
  descripcion: string; ingredientes: string[]; pasos: string[]; consejo: string;
}

const condicionLabels: Record<string, string> = {
  ninguna: 'Sin restricciones',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  colesterol: 'Colesterol alto',
  enfermedad_celiaca: 'Celiaquía',
  otro: 'Otra condición',
}

const desafios = [
  { titulo: 'Sin carne', desc: 'Cocina una receta 100% vegetal esta semana.', emoji: '🌿' },
  { titulo: 'Menos de 30 min', desc: 'Prepara una receta completa en menos de 30 minutos.', emoji: '⚡' },
  { titulo: 'Nuevo ingrediente', desc: 'Usa un ingrediente que no hayas cocinado antes esta semana.', emoji: '✨' },
  { titulo: 'Cocina para otros', desc: 'Prepara y comparte una comida con alguien especial.', emoji: '🤝' },
  { titulo: 'Desayuno nutritivo', desc: 'Prepara un desayuno saludable 3 días seguidos.', emoji: '🌅' },
  { titulo: 'Publica tu receta', desc: 'Comparte una receta propia con la comunidad Salvia.', emoji: '📖' },
  { titulo: 'Sin azúcar refinada', desc: 'Cocina sin azúcar refinada durante 3 días.', emoji: '🍃' },
  { titulo: 'Leguminosas', desc: 'Incorpora frijoles, lentejas o garbanzos a tus platillos.', emoji: '🫘' },
]

function getStreak(): number {
  if (typeof window === 'undefined') return 1
  const hoy = new Date().toISOString().split('T')[0]
  const ayer = new Date(Date.now() - 864e5).toISOString().split('T')[0]
  const storedDate = localStorage.getItem('salvia_streak_date')
  const storedCount = parseInt(localStorage.getItem('salvia_streak_count') ?? '0')
  let streak = 1
  if (storedDate === ayer) streak = storedCount + 1
  else if (storedDate === hoy) streak = storedCount
  if (storedDate !== hoy) {
    localStorage.setItem('salvia_streak_date', hoy)
    localStorage.setItem('salvia_streak_count', String(streak))
  }
  return streak
}

function getDesafio() {
  const semana = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  return desafios[semana % desafios.length]
}

export default function DashboardPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(1)
  const [desafio] = useState(getDesafio())
  const [sorpresa, setSorpresa] = useState<RecetaSorpresa | null>(null)
  const [sorprendiendo, setSorprendiendo] = useState(false)

  useEffect(() => {
    setStreak(getStreak())
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

  const sorprendeme = async () => {
    setSorprendiendo(true)
    try {
      const res = await fetch('/api/sorprendeme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condicion_salud: perfil?.condicion_salud ?? 'ninguna' }),
      })
      const data = await res.json()
      setSorpresa(data.receta)
    } finally {
      setSorprendiendo(false)
    }
  }

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

      <Onboarding />

      {/* Nav */}
      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </p>
        <div className="top-nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recetas</button>
          <button onClick={() => router.push('/ia-ingredientes')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>IA</button>
          <button onClick={() => router.push('/onchain')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>On-chain</button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Salir</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="dash-hero" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            {perfil?.condicion_salud && perfil.condicion_salud !== 'ninguna'
              ? condicionLabels[perfil.condicion_salud]
              : 'Bienvenido de vuelta'}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: '32px' }}>
            Hola,<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>{nombre}.</em>
          </h1>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
            <p style={{ fontSize: '16px', color: 'var(--fg-muted)', maxWidth: '480px', lineHeight: 1.7, fontWeight: 300 }}>
              ¿Qué quieres cocinar hoy? Dinos qué tienes en casa, sorpréndete con una idea, o explora la comunidad.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span style={{ fontSize: '24px', lineHeight: 1 }}>🔥</span>
              <div>
                <p style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 400, color: 'var(--fg)', lineHeight: 1 }}>{streak}</p>
                <p style={{ fontSize: '10px', color: 'var(--fg-light)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>
                  {streak === 1 ? 'día activo' : 'días seguidos'}
                </p>
              </div>
            </div>
          </div>

          {/* Sorpréndeme */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={sorprendeme}
              disabled={sorprendiendo}
              style={{
                padding: '16px 32px', background: sorprendiendo ? 'var(--fg-light)' : 'var(--accent)',
                color: 'var(--white)', border: 'none', fontSize: '13px', fontWeight: 500,
                letterSpacing: '0.2em', textTransform: 'uppercase',
                cursor: sorprendiendo ? 'wait' : 'pointer', transition: 'all .2s',
                boxShadow: '0 4px 12px rgba(29,61,26,0.15)',
              }}
            >
              {sorprendiendo ? 'Pensando...' : '✦ Sorpréndeme con una receta'}
            </button>
            <button
              onClick={() => router.push('/ia-ingredientes')}
              style={{
                padding: '16px 24px', background: 'none', color: 'var(--fg)',
                border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Con mis ingredientes →
            </button>
          </div>

          {sorpresa && (
            <div style={{ marginTop: '32px', padding: '28px', background: 'var(--surface)', border: '1px solid var(--border)', maxWidth: '720px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: 'var(--accent-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>
                    ✦ Sugerencia del momento
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.2 }}>
                    {sorpresa.nombre}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                  <span>{sorpresa.tiempo}</span>
                  <span>·</span>
                  <span>{sorpresa.porciones} porciones</span>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '20px' }}>
                {sorpresa.descripcion}
              </p>
              <details style={{ marginBottom: '16px' }}>
                <summary style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '12px' }}>
                  Ingredientes ({sorpresa.ingredientes.length})
                </summary>
                <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  {sorpresa.ingredientes.map((ing, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300 }}>{ing}</li>
                  ))}
                </ul>
              </details>
              <details>
                <summary style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '12px' }}>
                  Preparación ({sorpresa.pasos.length} pasos)
                </summary>
                <ol style={{ paddingLeft: '20px', marginTop: '8px' }}>
                  {sorpresa.pasos.map((p, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '6px' }}>{p}</li>
                  ))}
                </ol>
              </details>
              {sorpresa.consejo && (
                <p style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--fg-muted)', fontStyle: 'italic', lineHeight: 1.6, fontWeight: 300 }}>
                  💡 {sorpresa.consejo}
                </p>
              )}
              <button
                onClick={sorprendeme}
                style={{ marginTop: '20px', background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.15em', textTransform: 'uppercase', padding: 0 }}
              >
                ↻ Otra idea
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="dashboard-cards">
        {[
          {
            num: '01', titulo: 'IA con ingredientes',
            desc: 'Escribe lo que tienes en tu cocina y generamos recetas adaptadas a tu salud al instante.',
            cta: 'Generar recetas', ruta: '/ia-ingredientes',
            bg: 'var(--bg-dark)', color: 'var(--white)', goldNum: true,
          },
          {
            num: '02', titulo: 'Explorar recetas',
            desc: 'Descubre recetas de la comunidad, filtradas por tu condición de salud.',
            cta: 'Ver recetas', ruta: '/recetas',
            bg: 'var(--surface)', color: 'var(--fg)', goldNum: false,
          },
          {
            num: '03', titulo: 'Mi libro',
            desc: 'Tus recetas guardadas en un solo lugar. Accede a ellas cuando quieras cocinar.',
            cta: 'Ver mi libro', ruta: '/mis-recetas',
            bg: 'var(--bg)', color: 'var(--fg)', goldNum: false,
          },
        ].map(card => (
          <div
            key={card.num}
            style={{
              background: card.bg, padding: '48px 40px',
              borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '280px', cursor: 'pointer', transition: 'opacity .2s',
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

      {/* Desafío semanal */}
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="page-body" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <div className="dashboard-extra" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
            <div style={{ background: 'var(--bg)', padding: '40px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Desafío de la semana
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '32px', lineHeight: 1 }}>{desafio.emoji}</span>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.2, marginBottom: '12px' }}>
                    {desafio.titulo}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                    {desafio.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/ia-ingredientes')}
                style={{ marginTop: '24px', padding: '10px 20px', background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
              >
                Aceptar desafío →
              </button>
            </div>
            <div style={{ background: 'var(--bg)', padding: '40px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Plan semanal
              </p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--fg)', lineHeight: 1.2, marginBottom: '12px' }}>
                Organiza tu semana
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300 }}>
                Genera un plan de comidas para toda la semana con lista de compras automática.
              </p>
              <button
                onClick={() => router.push('/plan-semanal')}
                style={{ marginTop: '24px', padding: '10px 20px', background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
              >
                Ver plan →
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
