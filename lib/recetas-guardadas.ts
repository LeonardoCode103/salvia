const STORAGE_KEY = 'salvia_mis_recetas'

export type RecetaGuardada = {
  nombre: string
  tiempo: string
  porciones: number
  dificultad: string
  descripcion: string
  ingredientes: string[]
  pasos: string[]
  consejo: string
  guardadaEn: string
}

export function getRecetasGuardadas(): RecetaGuardada[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch { return [] }
}

export function guardarReceta(receta: Omit<RecetaGuardada, 'guardadaEn'>): boolean {
  const guardadas = getRecetasGuardadas()
  if (guardadas.some(r => r.nombre === receta.nombre)) return false
  guardadas.unshift({ ...receta, guardadaEn: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guardadas))
  return true
}

export function eliminarReceta(nombre: string): void {
  const guardadas = getRecetasGuardadas().filter(r => r.nombre !== nombre)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guardadas))
}

export function estaGuardada(nombre: string): boolean {
  return getRecetasGuardadas().some(r => r.nombre === nombre)
}
