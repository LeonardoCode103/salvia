'use client'

import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import BotonWallet from '@/app/components/BotonWallet'
import BottomNav from '@/app/components/BottomNav'
import {
  PROGRAM_ID,
  TITULO_MAX_BYTES,
  DESCRIPCION_MAX_BYTES,
  bytes,
  crearReceta,
  actualizarReceta,
  darLike,
  quitarLike,
  cerrarReceta,
  listarRecetas,
  recetasConMiLike,
  explorerTx,
  explorerCuenta,
  type RecetaOnChain,
  type Resultado,
} from '@/lib/solana/cliente'

const condiciones: Record<string, string> = {
  ninguna: 'General',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  colesterol: 'Colesterol',
  celiaca: 'Sin gluten',
}

type Movimiento = { hora: string; operacion: string; resultado: Resultado }

const formVacio = { titulo: '', descripcion: '', tiempo: '30', condicion: 'ninguna' }

const corta = (s: string) => `${s.slice(0, 4)}…${s.slice(-4)}`

export default function OnChainPage() {
  const router = useRouter()
  const wallet = useWallet()
  const miClave = wallet.publicKey?.toBase58()

  const [recetas, setRecetas] = useState<RecetaOnChain[]>([])
  const [misLikes, setMisLikes] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(true)
  const [errorLectura, setErrorLectura] = useState('')
  const [pendiente, setPendiente] = useState<string | null>(null)
  const [form, setForm] = useState(formVacio)
  const [errorForm, setErrorForm] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [edicion, setEdicion] = useState({ descripcion: '', tiempo: '' })
  const [historial, setHistorial] = useState<Movimiento[]>([])

  const recargar = useCallback(async () => {
    setErrorLectura('')
    try {
      const [lista, likes] = await Promise.all([
        listarRecetas(),
        wallet.publicKey ? recetasConMiLike(wallet.publicKey) : Promise.resolve(new Set<string>()),
      ])
      setRecetas(lista)
      setMisLikes(likes)
    } catch (e) {
      setErrorLectura(e instanceof Error ? e.message : 'No se pudo leer el programa en Devnet.')
    } finally {
      setCargando(false)
    }
  }, [wallet.publicKey])

  useEffect(() => { recargar() }, [recargar])

  const ejecutar = async (clave: string, operacion: string, accion: () => Promise<Resultado>) => {
    setPendiente(clave)
    let resultado: Resultado
    try {
      resultado = await accion()
    } catch (e) {
      resultado = { ok: false, mensaje: e instanceof Error ? e.message : String(e) }
    }
    setHistorial(h => [{ hora: new Date().toLocaleTimeString('es-MX'), operacion, resultado }, ...h])
    setPendiente(null)
    await recargar()
    return resultado
  }

  const publicar = async () => {
    setErrorForm('')
    const titulo = form.titulo.trim()
    const tiempo = parseInt(form.tiempo)
    if (!titulo) return setErrorForm('Escribe un título.')
    if (bytes(titulo) > TITULO_MAX_BYTES) return setErrorForm(`El título ocupa ${bytes(titulo)} bytes; el máximo es ${TITULO_MAX_BYTES}.`)
    if (bytes(form.descripcion) > DESCRIPCION_MAX_BYTES) return setErrorForm(`La descripción supera ${DESCRIPCION_MAX_BYTES} bytes.`)
    if (!(tiempo >= 1 && tiempo <= 600)) return setErrorForm('El tiempo debe estar entre 1 y 600 minutos.')

    const r = await ejecutar('crear', `Crear «${titulo}»`, () =>
      crearReceta(wallet, { titulo, descripcion: form.descripcion.trim(), tiempoMinutos: tiempo, condicionSalud: form.condicion }),
    )
    if (r.ok) setForm(formVacio)
  }

  const guardarEdicion = async (receta: RecetaOnChain) => {
    const tiempo = parseInt(edicion.tiempo)
    const r = await ejecutar(`editar:${receta.cuenta}`, `Actualizar «${receta.titulo}»`, () =>
      actualizarReceta(wallet, receta.cuenta, { descripcion: edicion.descripcion.trim(), tiempoMinutos: tiempo }),
    )
    if (r.ok) setEditando(null)
  }

  const ultimo = historial[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <nav className="top-nav" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10, gap: '16px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--fg)', letterSpacing: '0.05em' }}>
          Salvia
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button onClick={() => router.push('/recetas')} style={navLink}>Recetas</button>
          <BotonWallet />
        </div>
      </nav>

      <div className="page-header" style={{ borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <p style={eyebrow}>Registro público · Solana Devnet</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 300, color: 'var(--fg)', lineHeight: 1.0, letterSpacing: '-0.02em' }}>
              Recetas<br /><em style={{ fontStyle: 'italic' }}>on-chain.</em>
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--fg-muted)', maxWidth: '340px', lineHeight: 1.7, fontWeight: 300 }}>
            Cada receta es una cuenta firmada por su autor y cada like es una cuenta propia. Solo el autor puede editar o cerrar su receta, y solo cuando nadie la respalda.
          </p>
        </div>
        <p style={{ marginTop: '24px', fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.05em' }}>
          Programa{' '}
          <a href={explorerCuenta(PROGRAM_ID.toBase58())} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg-muted)', borderBottom: '1px solid var(--border)', fontFamily: 'monospace' }}>
            {PROGRAM_ID.toBase58()}
          </a>
        </p>
      </div>

      <div className="page-body">

        {/* Publicar */}
        <div style={{ padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
          <p style={eyebrow}>Publicar receta</p>
          {!wallet.connected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.7, fontWeight: 300, maxWidth: '480px' }}>
                Conecta Phantom o Solflare en la red Devnet para firmar. Si no tienes saldo, pide SOL de prueba en{' '}
                <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--fg)', borderBottom: '1px solid var(--fg)' }}>faucet.solana.com</a>.
              </p>
              <BotonWallet />
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '24px', maxWidth: '640px' }}>
              <div>
                <label style={label}>Título · {bytes(form.titulo)}/{TITULO_MAX_BYTES} bytes</label>
                <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Caldo de pollo bajo en sodio" style={input} />
              </div>
              <div>
                <label style={label}>Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} placeholder="Una línea sobre la receta" style={{ ...input, resize: 'vertical' }} />
              </div>
              <div className="time-grid">
                <div>
                  <label style={label}>Tiempo (min)</label>
                  <input type="number" min={1} max={600} value={form.tiempo} onChange={e => setForm({ ...form, tiempo: e.target.value })} style={input} />
                </div>
                <div>
                  <label style={label}>Apta para</label>
                  <select value={form.condicion} onChange={e => setForm({ ...form, condicion: e.target.value })} style={input}>
                    {Object.entries(condiciones).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                  </select>
                </div>
              </div>
              {errorForm && <p style={{ fontSize: '13px', color: 'var(--red)' }}>— {errorForm}</p>}
              <div>
                <button onClick={publicar} disabled={pendiente !== null} style={{ ...botonOscuro, background: pendiente === 'crear' ? 'var(--fg-light)' : 'var(--bg-dark)' }}>
                  {pendiente === 'crear' ? 'Esperando firma…' : 'Publicar en Solana'}
                </button>
              </div>
            </div>
          )}
        </div>

        {ultimo && <Aviso movimiento={ultimo} />}

        {/* Listado */}
        <div style={{ padding: '24px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ ...eyebrow, marginBottom: 0 }}>
            {cargando ? 'Leyendo cuentas…' : `${recetas.length} ${recetas.length === 1 ? 'receta' : 'recetas'} en el programa`}
          </p>
          <button onClick={recargar} style={{ ...navLink, fontSize: '11px' }}>Actualizar</button>
        </div>

        {errorLectura && <p style={{ fontSize: '13px', color: 'var(--red)', padding: '16px 0' }}>— {errorLectura}</p>}

        {!cargando && recetas.length === 0 && !errorLectura && (
          <div style={{ padding: '64px 0', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, color: 'var(--fg-muted)', marginBottom: '12px' }}>Sin recetas aún.</p>
            <p style={{ fontSize: '13px', color: 'var(--fg-light)' }}>La primera que publiques aparecerá aquí.</p>
          </div>
        )}

        {recetas.map((r, i) => {
          const cuenta = r.cuenta.toBase58()
          const esMia = miClave === r.autor.toBase58()
          const conMiLike = misLikes.has(cuenta)
          return (
            <div key={cuenta} style={{ borderBottom: '1px solid var(--border)' }}>
              <div style={{ padding: '32px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '16px' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--fg-light)', paddingTop: '4px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 400, color: 'var(--fg)', margin: 0, letterSpacing: '-0.01em' }}>{r.titulo}</h3>
                      <span style={etiqueta}>{condiciones[r.condicionSalud] ?? r.condicionSalud}</span>
                    </div>
                    {r.descripcion && (
                      <p style={{ fontSize: '14px', color: 'var(--fg-muted)', margin: '0 0 14px', lineHeight: 1.6, maxWidth: '560px', fontWeight: 300 }}>{r.descripcion}</p>
                    )}
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span style={meta}>{r.tiempoMinutos} min</span>
                      <span style={{ ...meta, color: r.likes > 0 ? 'var(--accent-light)' : 'var(--fg-light)' }}>{r.likes} {r.likes === 1 ? 'like' : 'likes'}</span>
                      <span style={meta}>Autor {esMia ? 'tú' : corta(r.autor.toBase58())}</span>
                      <a href={explorerCuenta(cuenta)} target="_blank" rel="noopener noreferrer" style={{ ...meta, borderBottom: '1px solid var(--border)' }}>Cuenta ↗</a>
                    </div>
                  </div>
                </div>

                {wallet.connected && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <BotonBorde
                      disabled={pendiente !== null}
                      onClick={() => ejecutar(`like:${cuenta}`, `${conMiLike ? 'Quitar like a' : 'Like a'} «${r.titulo}»`, () => conMiLike ? quitarLike(wallet, r.cuenta) : darLike(wallet, r.cuenta))}
                    >
                      {pendiente === `like:${cuenta}` ? '…' : conMiLike ? 'Quitar like' : 'Like'}
                    </BotonBorde>
                    <BotonBorde
                      disabled={pendiente !== null}
                      onClick={() => {
                        setEditando(editando === cuenta ? null : cuenta)
                        setEdicion({ descripcion: r.descripcion, tiempo: String(r.tiempoMinutos) })
                      }}
                    >
                      {editando === cuenta ? 'Cancelar' : 'Editar'}
                    </BotonBorde>
                    <BotonBorde
                      disabled={pendiente !== null}
                      onClick={() => ejecutar(`cerrar:${cuenta}`, `Cerrar «${r.titulo}»`, () => cerrarReceta(wallet, r.cuenta))}
                    >
                      {pendiente === `cerrar:${cuenta}` ? '…' : 'Cerrar'}
                    </BotonBorde>
                  </div>
                )}
              </div>

              {editando === cuenta && (
                <div className="recipe-expand" style={{ gridTemplateColumns: '1fr' }}>
                  <div style={{ display: 'grid', gap: '20px', maxWidth: '560px' }}>
                    <div>
                      <label style={label}>Descripción</label>
                      <textarea value={edicion.descripcion} onChange={e => setEdicion({ ...edicion, descripcion: e.target.value })} rows={2} style={{ ...input, resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={label}>Tiempo (min)</label>
                      <input type="number" min={1} max={600} value={edicion.tiempo} onChange={e => setEdicion({ ...edicion, tiempo: e.target.value })} style={{ ...input, maxWidth: '160px' }} />
                    </div>
                    <div>
                      <button onClick={() => guardarEdicion(r)} disabled={pendiente !== null} style={botonOscuro}>
                        {pendiente === `editar:${cuenta}` ? 'Esperando firma…' : 'Guardar cambios'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {historial.length > 0 && (
          <div style={{ padding: '48px 0 0' }}>
            <p style={eyebrow}>Transacciones de esta sesión</p>
            {historial.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr auto', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'baseline' }}>
                <span style={meta}>{m.hora}</span>
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--fg)', fontWeight: 300 }}>{m.operacion}</p>
                  <p style={{ fontSize: '12px', color: m.resultado.ok ? 'var(--accent-light)' : 'var(--red)', marginTop: '2px' }}>
                    {m.resultado.ok ? 'Confirmada' : `Rechazada${m.resultado.codigo ? ` · ${m.resultado.codigo}` : ''} — ${m.resultado.mensaje}`}
                  </p>
                </div>
                {m.resultado.firma ? (
                  <a href={explorerTx(m.resultado.firma)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--fg-muted)', fontFamily: 'monospace', borderBottom: '1px solid var(--border)' }}>
                    {corta(m.resultado.firma)} ↗
                  </a>
                ) : <span style={meta}>sin firma</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function Aviso({ movimiento }: { movimiento: Movimiento }) {
  const { resultado } = movimiento
  return (
    <div style={{
      margin: '24px 0 0', padding: '12px 16px', borderRadius: '2px',
      background: resultado.ok ? '#f0f4f0' : '#fdf0f0',
      border: `1px solid ${resultado.ok ? '#c5d5c5' : '#f5c5c5'}`,
    }}>
      <p style={{ fontSize: '13px', lineHeight: 1.5, color: resultado.ok ? 'var(--accent-light)' : 'var(--red)' }}>
        {resultado.ok ? `${movimiento.operacion}: confirmada en Devnet.` : `${movimiento.operacion}: ${resultado.mensaje}`}
        {resultado.firma && (
          <>
            {' '}
            <a href={explorerTx(resultado.firma)} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', borderBottom: '1px solid currentColor' }}>
              Ver transacción
            </a>
          </>
        )}
      </p>
    </div>
  )
}

function BotonBorde({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 500,
        letterSpacing: '0.15em', textTransform: 'uppercase', padding: '8px 16px', color: 'var(--fg)',
        cursor: disabled ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'var(--fg)'; e.currentTarget.style.color = 'var(--white)' } }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg)' }}
    >
      {children}
    </button>
  )
}

const eyebrow: CSSProperties = {
  fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.25em',
  textTransform: 'uppercase', marginBottom: '16px',
}

const navLink: CSSProperties = {
  background: 'none', border: 'none', fontSize: '12px', color: 'var(--fg-muted)',
  cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
}

const label: CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)',
  letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px',
}

const input: CSSProperties = {
  width: '100%', padding: '12px 0', border: 'none', borderBottom: '1.5px solid var(--border)',
  background: 'transparent', fontSize: '15px', color: 'var(--fg)', outline: 'none',
  fontFamily: 'var(--font-body)', WebkitTextFillColor: 'var(--fg)',
}

const etiqueta: CSSProperties = {
  fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
  color: 'var(--fg-light)', border: '1px solid var(--border)', padding: '3px 8px',
}

const meta: CSSProperties = {
  fontSize: '11px', color: 'var(--fg-light)', letterSpacing: '0.1em', textTransform: 'uppercase',
}

const botonOscuro: CSSProperties = {
  padding: '14px 28px', background: 'var(--bg-dark)', color: 'var(--white)', border: 'none',
  fontSize: '12px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer',
}
