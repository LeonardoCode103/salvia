'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

type Comentario = {
  id: string
  receta_id: string
  user_id: string
  autor_nombre: string
  texto: string
  created_at: string
}

const localKey = (recetaId: string) => `salvia_comentarios_${recetaId}`

function getLocal(recetaId: string): Comentario[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(localKey(recetaId)) ?? '[]')
  } catch { return [] }
}

function saveLocal(recetaId: string, lista: Comentario[]) {
  localStorage.setItem(localKey(recetaId), JSON.stringify(lista))
}

export default function Comentarios({ recetaId }: { recetaId: string }) {
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [texto, setTexto] = useState('')
  const [user, setUser] = useState<{ id: string; nombre: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [usandoDB, setUsandoDB] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (u) {
        const { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', u.id).single()
        setUser({ id: u.id, nombre: perfil?.nombre ?? u.email?.split('@')[0] ?? 'Usuario' })
      }

      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .eq('receta_id', recetaId)
        .order('created_at', { ascending: false })

      if (error) {
        setUsandoDB(false)
        setComentarios(getLocal(recetaId))
      } else {
        setComentarios(data ?? [])
      }
    }
    cargar()
  }, [recetaId])

  const enviar = async () => {
    if (!texto.trim() || texto.trim().length < 2 || !user) return
    setLoading(true)
    const supabase = createClient()
    const nuevo: Comentario = {
      id: crypto.randomUUID(),
      receta_id: recetaId,
      user_id: user.id,
      autor_nombre: user.nombre,
      texto: texto.trim(),
      created_at: new Date().toISOString(),
    }

    if (usandoDB) {
      const { data, error } = await supabase
        .from('comentarios')
        .insert({
          receta_id: recetaId,
          user_id: user.id,
          autor_nombre: user.nombre,
          texto: texto.trim(),
        })
        .select()
        .single()
      if (!error && data) {
        setComentarios([data, ...comentarios])
      } else {
        const lista = [nuevo, ...comentarios]
        setComentarios(lista)
        saveLocal(recetaId, lista)
      }
    } else {
      const lista = [nuevo, ...comentarios]
      setComentarios(lista)
      saveLocal(recetaId, lista)
    }
    setTexto('')
    setLoading(false)
  }

  const eliminar = async (id: string) => {
    if (usandoDB) {
      const supabase = createClient()
      await supabase.from('comentarios').delete().eq('id', id)
    }
    const lista = comentarios.filter(c => c.id !== id)
    setComentarios(lista)
    if (!usandoDB) saveLocal(recetaId, lista)
  }

  return (
    <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)', marginTop: '24px' }}>
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--fg-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
        Comentarios ({comentarios.length})
      </p>

      {user && (
        <div style={{ marginBottom: '24px' }}>
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Comparte tu experiencia con esta receta..."
            maxLength={500}
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', border: '1px solid var(--border)',
              background: 'transparent', fontSize: '14px', color: 'var(--fg)',
              outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)',
              fontWeight: 300, lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--fg-light)' }}>{texto.length}/500</span>
            <button
              onClick={enviar}
              disabled={loading || texto.trim().length < 2}
              style={{
                padding: '8px 18px', background: texto.trim().length >= 2 ? 'var(--fg)' : 'var(--surface)',
                color: texto.trim().length >= 2 ? 'var(--white)' : 'var(--fg-light)', border: 'none',
                fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: texto.trim().length >= 2 ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Enviando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {comentarios.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--fg-light)', fontStyle: 'italic' }}>
          Sé el primero en comentar.
        </p>
      ) : (
        <div>
          {comentarios.map(c => (
            <div key={c.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fg)' }}>
                  {c.autor_nombre}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--fg-light)' }}>
                  {new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--fg-muted)', lineHeight: 1.6, fontWeight: 300 }}>
                {c.texto}
              </p>
              {user?.id === c.user_id && (
                <button
                  onClick={() => eliminar(c.id)}
                  style={{ background: 'none', border: 'none', fontSize: '10px', color: 'var(--fg-light)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '6px', padding: 0 }}
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!usandoDB && (
        <p style={{ fontSize: '10px', color: 'var(--fg-light)', marginTop: '16px', fontStyle: 'italic' }}>
          Comentarios guardados localmente. Activa la tabla `comentarios` en Supabase para verlos en otros dispositivos.
        </p>
      )}
    </div>
  )
}
