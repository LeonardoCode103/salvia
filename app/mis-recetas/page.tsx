'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/app/components/BottomNav'
import { getRecetasGuardadas, eliminarReceta, type RecetaGuardada } from '@/lib/recetas-guardadas'

export default function MisRecetasPage() {
  const router = useRouter()
  const [recetas, setRecetas] = useState<RecetaGuardada[]>([])
  const [abierta, setAbierta] = useState<number | null>(null)

  useEffect(() => {
    setRecetas(getRecetasGuardadas())
  }, [])

  const handleEliminar = (nombre: string) => {
    eliminarReceta(nombre)
    setRecetas(getRecetasGuardadas())
    setAbierta(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button onClick={() => router.push('/ia-ingredientes')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>IA Chef</button>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Inicio</button>
        </div>
      </nav>

      <div className="page-header">
        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
          Mi colección · {recetas.length} {recetas.length === 1 ? 'receta' : 'recetas'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
          Mi<br /><em style={{ fontStyle: 'italic' }}>libro.</em>
        </h1>
      </div>

      <div className="page-body">
        {recetas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: '48px', height: '48px', border: '1px solid var(--border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 3h10a1 1 0 011 1v12a1 1 0 01-1 1H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="var(--fg-light)" strokeWidth="1.5"/>
                <path d="M10 7v6M7 10h6" stroke="var(--fg-light)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--fg-muted)', marginBottom: '24px', lineHeight: 1.7 }}>
              Tu libro está vacío. Guarda recetas desde el chef IA<br />y aparecerán aquí.
            </p>
            <button
              onClick={() => router.push('/ia-ingredientes')}
              style={{ padding: '12px 28px', background: 'var(--fg)', color: 'var(--white)', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Ir al chef IA →
            </button>
          </div>
        ) : (
          <div>
            {recetas.map((receta, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '16px' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px' }}>
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', margin: 0 }}>
                          {receta.nombre}
                        </h3>
                        <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-light)', border: '1px solid var(--border)', padding: '3px 8px' }}>
                          {receta.dificultad}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 14px', lineHeight: 1.6, maxWidth: '520px', fontWeight: 300 }}>
                        {receta.descripcion}
                      </p>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.tiempo}</span>
                        <span style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{receta.porciones} porciones</span>
                        <span style={{ fontSize: '11px', color: 'var(--accent-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          Guardada {new Date(receta.guardadaEn).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => setAbierta(abierta === i ? null : i)}
                      style={{ background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg)', whiteSpace: 'nowrap', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
                    >
                      {abierta === i ? 'Cerrar' : 'Ver receta'}
                    </button>
                    <button
                      onClick={() => handleEliminar(receta.nombre)}
                      style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px', cursor: 'pointer', color: 'var(--fg-light)', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-light)' }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {abierta === i && (
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
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
