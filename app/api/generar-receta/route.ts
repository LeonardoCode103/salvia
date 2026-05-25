import { NextRequest, NextResponse } from 'next/server'

// ============================================
// MODO DEMO — sin API key de Claude
// Cuando tengas los $5, descomenta el bloque
// de Claude y comenta el bloque de DEMO
// ============================================

const recetasDemo: Record<string, object[]> = {
  default: [
    {
      nombre: 'Sopa de verduras casera',
      tiempo: '30 minutos',
      porciones: 4,
      dificultad: 'Fácil',
      descripcion: 'Una sopa reconfortante con las verduras que tienes en casa.',
      ingredientes: [
        '2 zanahorias medianas',
        '2 papas medianas',
        '1 cebolla',
        '2 dientes de ajo',
        '1 litro de caldo de pollo o agua',
        'Sal y pimienta al gusto',
        'Cilantro fresco'
      ],
      pasos: [
        'Lava y corta todas las verduras en cubos medianos.',
        'En una olla calienta un poco de aceite y sofríe la cebolla y el ajo por 3 minutos.',
        'Agrega las zanahorias y papas, revuelve bien.',
        'Vierte el caldo o agua y deja hervir a fuego medio por 20 minutos.',
        'Sazona con sal y pimienta. Sirve con cilantro fresco.'
      ],
      consejo: 'Puedes agregar cualquier verdura que tengas disponible.',
      apta_para: ['ninguna', 'diabetes', 'hipertension', 'colesterol']
    },
    {
      nombre: 'Arroz con huevo y verduras',
      tiempo: '20 minutos',
      porciones: 2,
      dificultad: 'Muy fácil',
      descripcion: 'Un platillo rápido, nutritivo y delicioso con lo básico de tu cocina.',
      ingredientes: [
        '1 taza de arroz',
        '2 huevos',
        '1 cebolla pequeña',
        '1 zanahoria',
        'Aceite, sal y pimienta',
        'Salsa de soya (opcional)'
      ],
      pasos: [
        'Cocina el arroz según las instrucciones del empaque.',
        'Mientras tanto, corta la cebolla y zanahoria en cuadritos pequeños.',
        'En un sartén con aceite, sofríe la cebolla y zanahoria por 5 minutos.',
        'Empuja las verduras a un lado y bate los huevos en el mismo sartén.',
        'Mezcla todo con el arroz cocido. Sazona y sirve caliente.'
      ],
      consejo: 'Agrega unas gotas de limón para darle más sabor.',
      apta_para: ['ninguna', 'diabetes', 'colesterol']
    },
    {
      nombre: 'Ensalada fresca con aderezo de limón',
      tiempo: '10 minutos',
      porciones: 2,
      dificultad: 'Muy fácil',
      descripcion: 'Ligera, fresca y perfecta para cualquier hora del día.',
      ingredientes: [
        '2 jitomates',
        '1 pepino',
        '1/2 cebolla morada',
        'Jugo de 1 limón',
        '2 cucharadas de aceite de oliva',
        'Sal, pimienta y orégano',
        'Aguacate (opcional)'
      ],
      pasos: [
        'Lava y corta el jitomate, pepino y cebolla en cubos.',
        'Mezcla todo en un tazón grande.',
        'Prepara el aderezo: limón, aceite, sal, pimienta y orégano.',
        'Vierte el aderezo sobre la ensalada y mezcla bien.',
        'Sirve inmediatamente o refrigera 10 minutos antes de servir.'
      ],
      consejo: 'Ideal como acompañamiento o plato principal ligero.',
      apta_para: ['ninguna', 'diabetes', 'hipertension', 'colesterol', 'enfermedad_celiaca']
    }
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { ingredientes, condicion_salud } = await req.json()

    if (!ingredientes || ingredientes.trim().length < 3) {
      return NextResponse.json({ error: 'Escribe al menos un ingrediente' }, { status: 400 })
    }

    // ============================================
    // DEMO — recetas de ejemplo
    // Simula un delay real de IA
    // ============================================
    await new Promise(resolve => setTimeout(resolve, 1500))
    const recetas = recetasDemo.default

    // ============================================
    // CLAUDE REAL — descomenta cuando tengas la key
    // ============================================
    /*
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const condicionTexto: Record<string, string> = {
      ninguna: 'sin restricciones especiales',
      diabetes: 'diabetes tipo 2 (evitar azúcares simples, harinas refinadas, alimentos de alto índice glucémico)',
      hipertension: 'hipertensión (evitar sal en exceso, embutidos, alimentos procesados)',
      colesterol: 'colesterol alto (evitar grasas saturadas, fritos, lácteos enteros)',
      enfermedad_celiaca: 'enfermedad celíaca (sin gluten, evitar trigo, cebada, centeno)',
      otro: 'condición especial de salud'
    }

    const mensaje = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Eres un nutriólogo experto. El usuario tiene: ${condicionTexto[condicion_salud] || 'sin restricciones'}.

Los ingredientes que tiene disponibles son: ${ingredientes}

Genera exactamente 3 recetas en formato JSON. Responde SOLO con el JSON, sin texto adicional, sin markdown.

Formato requerido:
[
  {
    "nombre": "Nombre de la receta",
    "tiempo": "X minutos",
    "porciones": 2,
    "dificultad": "Fácil/Media/Difícil",
    "descripcion": "Descripción breve apetitosa",
    "ingredientes": ["ingrediente 1", "ingrediente 2"],
    "pasos": ["Paso 1 detallado", "Paso 2 detallado"],
    "consejo": "Tip nutricional o de cocina",
    "apta_para": ["condición1"]
  }
]`
      }]
    })

    const texto = mensaje.content[0].type === 'text' ? mensaje.content[0].text : ''
    const recetas = JSON.parse(texto.replace(/```json|```/g, '').trim())
    */

    return NextResponse.json({ recetas, modo: 'demo' })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error generando recetas' }, { status: 500 })
  }
}