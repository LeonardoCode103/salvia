import { NextRequest, NextResponse } from 'next/server'

const condicionTexto: Record<string, string> = {
  ninguna: 'sin restricciones especiales de salud',
  diabetes: 'diabetes tipo 2 (evitar azúcares simples, harinas refinadas y alimentos de alto índice glucémico; priorizar fibra, proteínas magras y grasas saludables)',
  hipertension: 'hipertensión arterial (evitar sal en exceso, embutidos y alimentos procesados; priorizar alimentos ricos en potasio y verduras frescas)',
  colesterol: 'colesterol alto (evitar grasas saturadas, fritos y lácteos enteros; priorizar omega-3, fibra soluble y aceite de oliva)',
  enfermedad_celiaca: 'enfermedad celíaca (sin gluten: evitar trigo, cebada y centeno; usar arroz, maíz, papa o avena certificada sin gluten)',
  otro: 'condición especial de salud (preparar recetas saludables, equilibradas y bajas en grasas saturadas y sodio)',
}

const PROMPT = (condicion: string, ingredientes: string) => `Eres chef y nutriólogo experto. El usuario tiene: ${condicion}.
Los ingredientes disponibles son: ${ingredientes}

Genera EXACTAMENTE 3 recetas usando principalmente esos ingredientes. Responde SOLO con JSON válido, sin markdown ni texto adicional.

REGLAS OBLIGATORIAS para los pasos:
- Cada paso contiene UNA SOLA acción física
- Incluye tiempo exacto ("3 minutos", "30 segundos")
- Incluye temperatura o nivel de fuego si aplica ("fuego medio-alto", "180°C")
- Incluye señal visual de cuándo está listo ("hasta que esté dorado", "hasta que el agua se absorba", "hasta que al pincharlo el tenedor entre sin resistencia")
- Escribe como si la persona jamás hubiera cocinado

[
  {
    "nombre": "Nombre atractivo de la receta",
    "tiempo": "X minutos",
    "porciones": 2,
    "dificultad": "Fácil",
    "descripcion": "Descripción apetitosa en 1-2 oraciones",
    "ingredientes": ["cantidad + ingrediente exacto"],
    "pasos": ["Paso con acción única, tiempo exacto y señal visual de cuándo está listo"],
    "consejo": "Tip nutricional específico para la condición de salud del usuario"
  }
]`

export async function POST(req: NextRequest) {
  try {
    const { ingredientes, condicion_salud } = await req.json()

    if (!ingredientes || ingredientes.trim().length < 3) {
      return NextResponse.json({ error: 'Escribe al menos un ingrediente' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const condicion = condicionTexto[condicion_salud] ?? condicionTexto.ninguna

    if (!apiKey || apiKey.startsWith('aqui_')) {
      await new Promise(resolve => setTimeout(resolve, 1200))
      return NextResponse.json({ recetas: recetasDemo, modo: 'demo' })
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT(condicion, ingredientes) }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2500 },
        }),
      }
    )

    if (!geminiRes.ok) {
      console.error('Gemini error:', await geminiRes.text())
      return NextResponse.json({ recetas: recetasDemo, modo: 'demo' })
    }

    const data = await geminiRes.json()
    const texto: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const jsonText = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const recetas = JSON.parse(jsonText)

    return NextResponse.json({ recetas, modo: 'ia' })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ recetas: recetasDemo, modo: 'demo' })
  }
}

const recetasDemo = [
  {
    nombre: 'Sopa de verduras casera',
    tiempo: '30 minutos',
    porciones: 4,
    dificultad: 'Fácil',
    descripcion: 'Una sopa reconfortante con las verduras que tienes en casa. Ligera y llena de nutrientes.',
    ingredientes: [
      '2 zanahorias medianas',
      '2 papas medianas',
      '1 cebolla blanca',
      '2 dientes de ajo',
      '1 litro de agua o caldo de pollo bajo en sodio',
      'Sal y pimienta al gusto',
      'Cilantro fresco',
    ],
    pasos: [
      'Pela y corta las zanahorias, papas y cebolla en cubos de 2 cm. Aplasta los dientes de ajo con la hoja del cuchillo. Reserva todo junto.',
      'Calienta 1 cucharada de aceite en una olla grande a fuego medio por 1 minuto, hasta que al inclinar la olla el aceite se mueva libremente.',
      'Agrega la cebolla y el ajo al aceite. Sofríe 3–4 minutos sin dejar de mover, hasta que la cebolla esté translúcida (como cristal) y los bordes empiecen a dorarse.',
      'Agrega las zanahorias y papas. Mezcla y cocina 2 minutos más, hasta que las verduras tomen un poco de color dorado en los bordes.',
      'Vierte 1 litro de agua o caldo. Sube el fuego a alto y espera a que hierva; verás burbujas grandes y constantes (aprox. 5 minutos).',
      'Baja el fuego a medio-bajo y cocina sin tapar 20 minutos, hasta que al pinchar una papa con un tenedor entre sin resistencia.',
      'Apaga el fuego. Prueba y ajusta sal y pimienta. Sirve caliente con cilantro fresco picado encima.',
    ],
    consejo: 'Usa caldo bajo en sodio o agua en lugar de caldo regular. Las verduras dan suficiente sabor con hierbas frescas sin necesitar sal extra.',
  },
  {
    nombre: 'Arroz con huevo y verduras',
    tiempo: '20 minutos',
    porciones: 2,
    dificultad: 'Muy fácil',
    descripcion: 'Un platillo rápido, nutritivo y completo con lo básico que tienes en casa.',
    ingredientes: [
      '1 taza de arroz blanco',
      '2 huevos',
      '1 cebolla pequeña',
      '1 zanahoria mediana',
      '1 cucharada de aceite',
      'Sal y pimienta al gusto',
    ],
    pasos: [
      'Pon el arroz en una olla con 2 tazas de agua y una pizca de sal. Tapa y cocina a fuego alto hasta que hierva (3–4 min).',
      'En cuanto hierva, baja el fuego al mínimo y cocina tapado 15 minutos más, hasta que el agua se absorba por completo y el arroz esté esponjoso.',
      'Mientras el arroz cuece, pela la zanahoria y córtala en cubitos de 1 cm. Corta la cebolla en cuadros pequeños de 5 mm.',
      'Calienta 1 cucharada de aceite en un sartén a fuego medio-alto por 1 minuto.',
      'Agrega la cebolla y zanahoria. Cocina 5 minutos moviendo cada 30 segundos, hasta que la zanahoria esté tierna al pincharla y la cebolla esté dorada.',
      'Empuja las verduras hacia los bordes del sartén. En el centro, bate los 2 huevos directamente y revuelve rápido con una espátula durante 2 minutos, hasta que ya no quede parte líquida.',
      'Agrega el arroz cocido al sartén. Mezcla todo durante 1 minuto a fuego medio hasta integrar bien. Prueba y ajusta sal y pimienta.',
    ],
    consejo: 'Para bajar el índice glucémico, sustituye el arroz blanco por arroz integral o de coliflor rallado. El huevo aporta proteína completa que ayuda a estabilizar el azúcar en sangre.',
  },
  {
    nombre: 'Ensalada fresca con aderezo de limón',
    tiempo: '10 minutos',
    porciones: 2,
    dificultad: 'Muy fácil',
    descripcion: 'Ligera, fresca y perfecta en cualquier momento. Lista en menos de 10 minutos.',
    ingredientes: [
      '2 jitomates maduros',
      '1 pepino mediano',
      '1/2 cebolla morada',
      'Jugo de 1 limón',
      '2 cucharadas de aceite de oliva',
      'Sal, pimienta negra y orégano seco',
    ],
    pasos: [
      'Lava los jitomates y el pepino bajo agua fría durante 30 segundos, frotando con las manos para quitar residuos.',
      'Corta los jitomates en cubos de 2 cm. Corta el pepino en rodajas de medio centímetro. Corta la cebolla morada en aros finos. Coloca todo en un tazón grande.',
      'En un vaso pequeño, mezcla el jugo de limón, el aceite de oliva, una pizca generosa de sal, pimienta y media cucharadita de orégano. Bate con un tenedor hasta que quede homogéneo (sin separarse el aceite del limón).',
      'Vierte el aderezo sobre las verduras y mezcla con una cuchara grande hasta que todo quede cubierto.',
      'Refrigera 10 minutos antes de servir para que los sabores se integren, o sirve de inmediato.',
    ],
    consejo: 'El pepino y el jitomate son muy bajos en calorías y tienen casi nada de azúcar. Son ideales como colación o guarnición para personas con diabetes o hipertensión.',
  },
]
