'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from '@/app/components/BottomNav'

type Comida = { nombre: string; ingredientes: string[]; tiempo: string }
type Dia = { dia: string; desayuno: Comida; comida: Comida; cena: Comida }
type Plan = { dias: Dia[] }

const STORAGE_KEY = 'salvia_plan_semanal'

function getListaCompras(plan: Plan): string[] {
  const set = new Set<string>()
  for (const dia of plan.dias) {
    for (const comida of [dia.desayuno, dia.comida, dia.cena]) {
      for (const ing of comida.ingredientes ?? []) {
        set.add(ing.toLowerCase().trim())
      }
    }
  }
  return Array.from(set).sort()
}

export default function PlanSemanalPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('')
  const [condicionSalud, setCondicionSalud] = useState('ninguna')
  const [vista, setVista] = useState<'plan' | 'compras'>('plan')
  const [comprasChecked, setComprasChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('perfiles').select('condicion_salud').eq('id', user.id).single()
      if (data?.condicion_salud) setCondicionSalud(data.condicion_salud)
    }
    cargar()
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { plan: p, modo: m } = JSON.parse(saved)
        setPlan(p)
        setModo(m)
      } catch {}
    }
  }, [router])

  const generarPlan = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plan-semanal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condicion_salud: condicionSalud }),
      })
      const data = await res.json()
      setPlan(data.plan)
      setModo(data.modo)
      setComprasChecked(new Set())
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ plan: data.plan, modo: data.modo }))
    } catch {
      // keep existing plan
    } finally {
      setLoading(false)
    }
  }

  const lista = plan ? getListaCompras(plan) : []

  const toggleCompra = (item: string) => {
    setComprasChecked(prev => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
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

      {/* Header */}
      <div className="ia-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '900px', paddingBottom: '48px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Planificación · 7 días
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '24px' }}>
            Plan<br /><em style={{ fontStyle: 'italic' }}>semanal.</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, marginBottom: '32px', maxWidth: '520px' }}>
            Un plan de desayuno, comida y cena para cada día de la semana, con tu lista de compras automática.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={generarPlan}
              disabled={loading}
              style={{ padding: '14px 28px', background: loading ? 'var(--fg-light)' : 'var(--fg)', color: 'var(--white)', border: 'none', fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s' }}
            >
              {loading ? 'Generando plan...' : plan ? 'Regenerar plan' : 'Generar plan'}
            </button>
            {plan && (
              <>
                <button
                  onClick={() => setVista('plan')}
                  style={{ padding: '14px 24px', background: vista === 'plan' ? 'var(--surface)' : 'none', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg)' }}
                >
                  Ver plan
                </button>
                <button
                  onClick={() => setVista('compras')}
                  style={{ padding: '14px 24px', background: vista === 'compras' ? 'var(--surface)' : 'none', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--fg)' }}
                >
                  Lista de compras ({lista.length})
                </button>
              </>
            )}
          </div>
          {plan && modo && (
            <p style={{ marginTop: '16px', fontSize: '11px', color: modo === 'ia' ? 'var(--accent-light)' : 'var(--fg-light)', letterSpacing: '0.1em' }}>
              {modo === 'ia' ? '✦ Plan generado con IA' : 'Plan de ejemplo · Agrega tu clave Gemini para personalizar'}
            </p>
          )}
        </div>
      </div>

      {/* Contenido */}
      {plan && vista === 'plan' && (
        <div className="page-body" style={{ paddingTop: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '20px 16px 12px 0', textAlign: 'left', fontSize: '10px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', width: '80px', borderBottom: '1px solid var(--border)' }}>Día</th>
                  {['Desayuno', 'Comida', 'Cena'].map(c => (
                    <th key={c} style={{ padding: '20px 16px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.dias.map((dia, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '24px 16px 24px 0', verticalAlign: 'top' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--fg)', whiteSpace: 'nowrap' }}>{dia.dia}</p>
                    </td>
                    {[dia.desayuno, dia.comida, dia.cena].map((comida, j) => (
                      <td key={j} style={{ padding: '24px 16px', verticalAlign: 'top' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--fg)', marginBottom: '6px', lineHeight: 1.3 }}>{comida.nombre}</p>
                        <p style={{ fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.05em', marginBottom: '6px' }}>{comida.tiempo}</p>
                        <p style={{ fontSize: '12px', color: 'var(--fg-muted)', fontWeight: 300, lineHeight: 1.5 }}>
                          {comida.ingredientes?.slice(0, 4).join(', ')}{(comida.ingredientes?.length ?? 0) > 4 ? '...' : ''}
                        </p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {plan && vista === 'compras' && (
        <div className="page-body" style={{ paddingTop: '40px' }}>
          <div style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Lista de compras
                </p>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', fontWeight: 300 }}>
                  {comprasChecked.size} de {lista.length} ingredientes
                </p>
              </div>
              {comprasChecked.size > 0 && (
                <button
                  onClick={() => setComprasChecked(new Set())}
                  style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Limpiar
                </button>
              )}
            </div>
            <div>
              {lista.map((item, i) => (
                <div
                  key={i}
                  onClick={() => toggleCompra(item)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '18px', height: '18px', border: '1.5px solid', flexShrink: 0,
                    borderColor: comprasChecked.has(item) ? 'var(--accent-light)' : 'var(--border)',
                    background: comprasChecked.has(item) ? 'var(--accent-light)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                  }}>
                    {comprasChecked.has(item) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: '15px', color: comprasChecked.has(item) ? 'var(--fg-light)' : 'var(--fg)',
                    fontWeight: 300, textDecoration: comprasChecked.has(item) ? 'line-through' : 'none',
                    textDecorationColor: 'var(--fg-light)', transition: 'all .15s',
                  }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!plan && !loading && (
        <div className="page-body" style={{ paddingTop: '80px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--fg-muted)', fontWeight: 300, lineHeight: 1.7 }}>
            Presiona "Generar plan" para crear tu plan de comidas personalizado.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
