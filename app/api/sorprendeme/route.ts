import { NextRequest, NextResponse } from 'next/server'
import { pedirAGemini } from '@/lib/gemini'

export const maxDuration = 60

const condicionTexto: Record<string, string> = {
  ninguna: 'sin restricciones especiales',
  diabetes: 'diabetes (sin azúcares simples ni harinas refinadas)',
  hipertension: 'hipertensión (bajo en sodio)',
  colesterol: 'colesterol alto (bajo en grasas saturadas)',
  enfermedad_celiaca: 'celiaquía (sin gluten)',
  otro: 'salud general',
}

const horaActual = () => {
  const h = new Date().getHours()
  if (h < 11) return { comida: 'desayuno', ejemplo: 'huevos, avena, fruta, smoothie' }
  if (h < 17) return { comida: 'comida fuerte', ejemplo: 'guisado, sopa, plato fuerte' }
  if (h < 22) return { comida: 'cena ligera', ejemplo: 'algo ligero, ensalada, sándwich, sopa' }
  return { comida: 'snack saludable', ejemplo: 'algo simple, fruta, yogur' }
}

export async function POST(req: NextRequest) {
  const { condicion_salud = 'ninguna' } = await req.json().catch(() => ({}))
  const condicion = condicionTexto[condicion_salud] ?? condicionTexto.ninguna
  const { comida, ejemplo } = horaActual()

  const prompt = `Eres chef mexicano experto en nutrición. El usuario tiene ${condicion}.
Es hora de ${comida} (en México). Sugiere UNA receta sorpresa apropiada para esta hora (ej. ${ejemplo}).
Usa ingredientes COMUNES de México (los que cualquiera tiene en casa).

Responde SOLO JSON válido, sin markdown:
{
  "nombre": "Nombre apetitoso",
  "tiempo": "X minutos",
  "porciones": 2,
  "dificultad": "Fácil",
  "descripcion": "Una oración",
  "ingredientes": ["cantidad + ingrediente"],
  "pasos": ["paso con acción única, tiempo exacto y señal visual"],
  "consejo": "Tip nutricional para ${condicion}"
}`

  try {
    const text = (await pedirAGemini(prompt, 1.2)) ?? ''
    const json = text.match(/\{[\s\S]*\}/)?.[0]
    if (!json) throw new Error('no json')
    const receta = JSON.parse(json)
    return NextResponse.json({ receta, modo: 'ia', momento: comida })
  } catch {
    return NextResponse.json({
      receta: {
        nombre: 'Quesadilla de espinaca',
        tiempo: '8 minutos',
        porciones: 1,
        dificultad: 'Muy fácil',
        descripcion: 'Rápida y nutritiva.',
        ingredientes: ['1 tortilla', 'Espinaca', 'Queso panela', 'Salsa verde'],
        pasos: ['Calienta tortilla 30 seg.', 'Agrega queso y espinaca.', 'Dobla y cocina 1 min por lado.'],
        consejo: 'Receta ligera.',
      },
      modo: 'demo',
    })
  }
}
