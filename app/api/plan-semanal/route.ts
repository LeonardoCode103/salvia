import { NextRequest, NextResponse } from 'next/server'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DEMO_PLAN = {
  dias: DIAS.map((dia, i) => ({
    dia,
    desayuno: {
      nombre: ['Avena con fruta', 'Huevos revueltos', 'Smoothie verde', 'Yogur con granola', 'Pan integral con aguacate', 'Omelette de verduras', 'Hotcakes de avena'][i],
      ingredientes: [['avena', 'plátano', 'leche'], ['huevo', 'chile', 'cebolla'], ['espinaca', 'manzana', 'leche'], ['yogur', 'granola', 'miel'], ['pan', 'aguacate', 'limón'], ['huevo', 'pimiento', 'champiñón'], ['avena', 'huevo', 'leche']][i],
      tiempo: '15 min',
    },
    comida: {
      nombre: ['Sopa de verduras', 'Pollo a la plancha con arroz', 'Ensalada César', 'Lentejas guisadas', 'Pescado al vapor', 'Pasta con verduras', 'Tacos de frijoles'][i],
      ingredientes: [['zanahoria', 'papa', 'calabaza'], ['pollo', 'arroz', 'ensalada'], ['lechuga', 'pollo', 'crutones'], ['lenteja', 'jitomate', 'ajo'], ['filete de pescado', 'limón', 'hierbas'], ['pasta', 'brócoli', 'ajo'], ['tortilla', 'frijoles', 'queso']][i],
      tiempo: '35 min',
    },
    cena: {
      nombre: ['Crema de calabaza', 'Quesadillas', 'Ensalada de atún', 'Sopa de pollo', 'Verduras al vapor', 'Tacos de huevo', 'Crema de zanahoria'][i],
      ingredientes: [['calabaza', 'cebolla', 'crema'], ['tortilla', 'queso', 'chile'], ['atún', 'jitomate', 'lechuga'], ['pollo', 'fideos', 'caldo'], ['brócoli', 'zanahoria', 'calabaza'], ['huevo', 'tortilla', 'salsa'], ['zanahoria', 'caldo', 'crema']][i],
      tiempo: '20 min',
    },
  })),
}

export async function POST(req: NextRequest) {
  const { condicion_salud = 'ninguna' } = await req.json().catch(() => ({}))

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.startsWith('aqui_')) {
    return NextResponse.json({ plan: DEMO_PLAN, modo: 'demo' })
  }

  const restriccion = condicion_salud !== 'ninguna'
    ? `IMPORTANTE: Todas las comidas deben ser aptas para personas con ${condicion_salud}. Evita ingredientes contraindicados.`
    : 'No hay restricciones dietéticas.'

  const prompt = `Genera un plan de comidas saludable para 7 días (lunes a domingo).
${restriccion}

Devuelve SOLO JSON válido, sin texto adicional, con esta estructura exacta:
{
  "dias": [
    {
      "dia": "Lunes",
      "desayuno": { "nombre": "...", "ingredientes": ["...", "..."], "tiempo": "... min" },
      "comida": { "nombre": "...", "ingredientes": ["...", "..."], "tiempo": "... min" },
      "cena": { "nombre": "...", "ingredientes": ["...", "..."], "tiempo": "... min" }
    }
  ]
}

Los 7 días en orden: Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo.
Usa ingredientes comunes de México. Los nombres deben ser concisos (2-5 palabras).
Cada lista de ingredientes: solo los principales (3-6 ítems), en singular, sin cantidades.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    )

    const geminiData = await res.json()
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ plan: DEMO_PLAN, modo: 'demo' })

    const plan = JSON.parse(jsonMatch[0])
    return NextResponse.json({ plan, modo: 'ia' })
  } catch {
    return NextResponse.json({ plan: DEMO_PLAN, modo: 'demo' })
  }
}
