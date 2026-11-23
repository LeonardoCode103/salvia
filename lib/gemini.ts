// Lite primero: responde en segundos y suele tener capacidad cuando el modelo completo está saturado (503).
const MODELOS = ['gemini-flash-lite-latest', 'gemini-flash-latest']

type Parte = { text?: string; thought?: boolean }

/** Devuelve el texto generado o null si no hay clave o ningún modelo respondió. */
export async function pedirAGemini(prompt: string, temperatura: number): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.startsWith('aqui_')) return null

  for (const modelo of MODELOS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // El razonamiento interno del modelo también consume tokens de salida.
          generationConfig: { temperature: temperatura, maxOutputTokens: 8192, responseMimeType: 'application/json' },
        }),
      },
    ).catch(() => null)

    if (!res?.ok) {
      console.error(`Gemini ${modelo} respondió ${res?.status ?? 'sin conexión'}`)
      continue
    }
    const data = await res.json()
    const partes: Parte[] = data?.candidates?.[0]?.content?.parts ?? []
    const texto = partes.filter(p => !p.thought).map(p => p.text ?? '').join('').trim()
    if (texto) return texto
  }
  return null
}
