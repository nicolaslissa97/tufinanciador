import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, riskProfile, country, timeframe, selectedAssets } = await request.json()

    if (!amount || !riskProfile || !country || !timeframe ) {
      return NextResponse.json({ error: "Monto y perfil de riesgo son requeridos" }, { status: 400 })
    }

    // Mapear perfil a español para el prompt
    const riskProfileMap: Record<string, string> = {
      conservative: "conservador",
      moderate: "moderado",
      risky: "riesgoso",
    }

    const timeframeMap: Record<string, string> = {
      short: "6 meses - 1 año",
      medium: "1.5 años - 3 años",
      long: "3 años o más",
    }

    const riskProfileSpanish = riskProfileMap[riskProfile] || riskProfile
    const timeframeSpanish = timeframeMap[timeframe] || timeframe

    // Construir el prompt según las especificaciones
    const systemPrompt = `Eres un Analista de Mercado con profundo conocimiento en fundamentales, valoración y estrategias de asignación de capital, y también eres un experto en análisis de ondas de Elliott (Elliott Wave).

Tu tarea es:
1. Seleccionar 5 activos de la bolsa de valores global (acciones, ETFs, o combinaciones de renta fija/variable) que sean óptimos para el horizonte del inversor ${timeframeSpanish}.
2. Diseñar una Estrategia de Inversión Óptima que incluya una propuesta de asignación de capital (porcentajes) para cada uno de los 5 activos seleccionados. Puedes combinar activos riesgosos, moderados y conservadores para cada perfil de inversor.
3. Indicar según tu análisis de ondas de Elliott el precio de entrada estimado para cada activo.

IMPORTANTE:
- El horizonte de inversión es de ${timeframeSpanish}
- Debes seleccionar exactamente 5 activos
- Los activos deben ser de la bolsa de valores global
- NO incluyas criptomonedas
- Puedes combinar diferentes niveles de riesgo en el portafolio según el perfil del inversor
- El precio de entrada debe basarse en análisis de ondas de Elliott

Estructura tu respuesta en formato JSON con el siguiente esquema:
{
  "strategy": {
    "description": "Breve descripción de la estrategia",
    "horizon": "${timeframeSpanish}"
  },
  "assets": [
    {
      "name": "Nombre del activo",
      "ticker": "Símbolo",
      "type": "Tipo (Acción/ETF/etc)",
      "percentage": 20,
      "amount": 10000,
      "entryPrice": 150.50,
      "estimatedShares": 66,
      "riskLevel": "conservador|moderado|riesgoso",
      "rationale": "Justificación de la asignación basada en análisis fundamental y técnico",
      "elliottWaveAnalysis": "Análisis detallado de ondas de Elliott para justificar el precio de entrada"
    }
  ]
}

Los porcentajes deben sumar 100% exactamente.
Responde SOLO con el JSON, sin texto adicional.`

    const userPrompt = `El inversor tiene un perfil ${riskProfileSpanish} y un monto total de inversión de $${amount.toLocaleString()} y su pais de residencia ${country} considera su pais para los activos que puede operar, no debemos incluir criptomonedas ni tampoco ETFs solo activos que sean operables en el pais del inversor.

${selectedAssets ? `El usuario ha mostrado interés en estos activos: ${JSON.stringify(selectedAssets)}. Puedes usarlos como referencia pero no estás limitado a ellos.` : ''}

Genera una estrategia de inversión óptima con 5 activos y sus asignaciones de capital correspondientes.`

    // ============================================
    // INTEGRACIÓN CON GOOGLE GEMINI
    // ============================================
    const geminiApiKey = process.env.GEMINI_API_KEY || "AIzaSyCjKEqAMTi7ADNGuum2EH-QtNcnt-zTwc0"
    
    try {
      // Combinar system prompt y user prompt para Gemini
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
      
      console.log("[GEMINI] Calling Gemini 2.5 Flash API...")
      console.log("[GEMINI] API Key:", geminiApiKey ? `${geminiApiKey.substring(0, 20)}...` : "NOT SET")
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        console.error("[GEMINI] API error:", errorData)
        console.error("[GEMINI] Response status:", response.status)
        console.error("[GEMINI] Response statusText:", response.statusText)
        throw new Error(`Error en la API de Gemini: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      console.log("[GEMINI] Success! Received response from Gemini")
      const content = data.candidates[0].content.parts[0].text
      
      console.log("[GEMINI] Raw content length:", content.length)
      console.log("[GEMINI] First 500 chars:", content.substring(0, 500))
      console.log("[GEMINI] Last 500 chars:", content.substring(Math.max(0, content.length - 500)))
      
      // Limpiar el contenido si tiene markdown code blocks
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '')
      }
      
      // Intentar arreglar JSON truncado o mal formado
      // Si el JSON está truncado, podemos intentar agregar la estructura faltante
      try {
        const parsedContent = JSON.parse(cleanContent)
        console.log("[GEMINI] Successfully parsed JSON")
        return NextResponse.json(parsedContent)
      } catch (parseError) {
        console.error("[GEMINI] JSON parsing error, attempting to fix...")
        console.error("[GEMINI] Parse error:", parseError)
        
        // Intentar buscar el JSON válido más grande
        let fixedContent = cleanContent
        // Si termina con comillas o llaves no cerradas, intentar arreglarlo
        if (!fixedContent.match(/}\s*$/)) {
          // Buscar el último } válido
          const lastBrace = fixedContent.lastIndexOf('}')
          if (lastBrace > 0) {
            fixedContent = fixedContent.substring(0, lastBrace + 1)
            console.log("[GEMINI] Attempting to fix truncated JSON")
          }
        }
        
        try {
          const parsedContent = JSON.parse(fixedContent)
          console.log("[GEMINI] Successfully parsed fixed JSON")
          return NextResponse.json(parsedContent)
        } catch (secondError) {
          console.error("[GEMINI] Could not parse JSON even after fix attempt")
          throw new Error(`Failed to parse JSON response: ${secondError}`)
        }
      }
    } catch (apiError) {
      console.error("[GEMINI] Error calling Gemini API, falling back to mock data:", apiError)
      console.error("[GEMINI] Error details:", apiError instanceof Error ? apiError.message : "Unknown error")
      // Fallback a datos de ejemplo si hay error
      
    const calculateAllocation = () => {
      if (riskProfile === "conservative") {
        return [
          {
            name: "Bonos del Tesoro de EE.UU. a 10 años",
            ticker: "TLT",
            type: "ETF de Bonos",
            percentage: 40,
            amount: amount * 0.4,
            entryPrice: 98.50,
            estimatedShares: Math.floor((amount * 0.4) / 98.50),
            riskLevel: "conservador",
            rationale: "Base sólida del portafolio con bajo riesgo y estabilidad. Excelente para preservar capital mientras se genera ingreso fijo.",
            elliottWaveAnalysis: "Onda 2 completada según Elliott Wave, corrección hacia Onda 4. Precio de entrada optimizado en $98.50 aprovechando la fase correctiva."
          },
          {
            name: "ETF S&P 500",
            ticker: "SPY",
            type: "ETF de Acciones",
            percentage: 30,
            amount: amount * 0.3,
            entryPrice: 420.00,
            estimatedShares: Math.floor((amount * 0.3) / 420.00),
            riskLevel: "moderado",
            rationale: "Diversificación amplia en el mercado estadounidense. Balance entre crecimiento y estabilidad.",
            elliottWaveAnalysis: "Onda 3 en desarrollo según Elliott Wave. Entrada en $420 aprovecha el momentum alcista con soporte técnico fuerte."
          },
          {
            name: "Acciones de Microsoft Corporation",
            ticker: "MSFT",
            type: "Acción",
            percentage: 15,
            amount: amount * 0.15,
            entryPrice: 380.00,
            estimatedShares: Math.floor((amount * 0.15) / 380.00),
            riskLevel: "moderado",
            rationale: "Liderazgo en cloud computing y IA. Márgenes consistentes y crecimiento sostenido.",
            elliottWaveAnalysis: "Onda 5 en progreso según Elliott Wave. Entrada en $380 aprovecha la continuación de la tendencia alcista."
          },
          {
            name: "ETF de Oro (GLD)",
            ticker: "GLD",
            type: "ETF de Commodities",
            percentage: 10,
            amount: amount * 0.1,
            entryPrice: 185.00,
            estimatedShares: Math.floor((amount * 0.1) / 185.00),
            riskLevel: "conservador",
            rationale: "Cobertura contra inflación y activo refugio. Diversificación fuera de activos financieros tradicionales.",
            elliottWaveAnalysis: "Onda correctiva completada según Elliott Wave, inicio de nueva tendencia alcista. Entrada en $185 aprovecha el soporte técnico."
          },
          {
            name: "ETF de Dividendos de Alta Calidad",
            ticker: "VIG",
            type: "ETF de Dividendos",
            percentage: 5,
            amount: amount * 0.05,
            entryPrice: 170.00,
            estimatedShares: Math.floor((amount * 0.05) / 170.00),
            riskLevel: "conservador",
            rationale: "Generación de ingresos pasivos a través de dividendos de empresas de alta calidad.",
            elliottWaveAnalysis: "Fase de consolidación según Elliott Wave. Entrada en $170 con enfoque en generación de ingresos."
          }
        ]
      } else if (riskProfile === "moderate") {
        return [
          {
            name: "ETF S&P 500",
            ticker: "SPY",
            type: "ETF de Acciones",
            percentage: 35,
            amount: amount * 0.35,
            entryPrice: 420.00,
            estimatedShares: Math.floor((amount * 0.35) / 420.00),
            riskLevel: "moderado",
            rationale: "Base diversificada del portafolio con exposición al mercado estadounidense.",
            elliottWaveAnalysis: "Onda 3 en desarrollo según Elliott Wave. Entrada en $420 con momentum positivo."
          },
          {
            name: "Acciones de Apple Inc.",
            ticker: "AAPL",
            type: "Acción",
            percentage: 25,
            amount: amount * 0.25,
            entryPrice: 165.00,
            estimatedShares: Math.floor((amount * 0.25) / 165.00),
            riskLevel: "moderado",
            rationale: "Líder tecnológico con expansión en servicios. Flujo de caja positivo consistente.",
            elliottWaveAnalysis: "Onda 4 en desarrollo según Elliott Wave, posible inicio de Onda 5. Entrada en $165 aprovecha el soporte técnico."
          },
          {
            name: "Acciones de Microsoft Corporation",
            ticker: "MSFT",
            type: "Acción",
            percentage: 20,
            amount: amount * 0.2,
            entryPrice: 380.00,
            estimatedShares: Math.floor((amount * 0.2) / 380.00),
            riskLevel: "moderado",
            rationale: "Liderazgo en cloud computing y IA. Crecimiento sostenido a largo plazo.",
            elliottWaveAnalysis: "Onda 5 en progreso según Elliott Wave. Entrada en $380 con volumen creciente."
          },
          {
            name: "ETF iShares MSCI Emerging Markets",
            ticker: "EEM",
            type: "ETF de Mercados Emergentes",
            percentage: 12,
            amount: amount * 0.12,
            entryPrice: 42.50,
            estimatedShares: Math.floor((amount * 0.12) / 42.50),
            riskLevel: "riesgoso",
            rationale: "Exposición a mercados emergentes para potencial de crecimiento superior.",
            elliottWaveAnalysis: "Onda 3 extendida según Elliott Wave. Entrada en $42.50 con alto potencial alcista."
          },
          {
            name: "ETF de Oro (GLD)",
            ticker: "GLD",
            type: "ETF de Commodities",
            percentage: 8,
            amount: amount * 0.08,
            entryPrice: 185.00,
            estimatedShares: Math.floor((amount * 0.08) / 185.00),
            riskLevel: "moderado",
            rationale: "Cobertura y diversificación del portafolio.",
            elliottWaveAnalysis: "Onda correctiva completada según Elliott Wave. Entrada en $185 con nuevo impulso alcista."
          }
        ]
      } else {
        // risky
        return [
          {
            name: "ETF iShares MSCI Brazil",
            ticker: "EWZ",
            type: "ETF de Mercados Emergentes",
            percentage: 25,
            amount: amount * 0.25,
            entryPrice: 28.50,
            estimatedShares: Math.floor((amount * 0.25) / 28.50),
            riskLevel: "riesgoso",
            rationale: "Alto potencial de crecimiento en mercado emergente con reformas económicas en curso.",
            elliottWaveAnalysis: "Onda 3 en progreso según Elliott Wave. Entrada en $28.50 aprovecha el momentum alcista con soporte en Fibonacci."
          },
          {
            name: "ETF iShares MSCI India",
            ticker: "INDA",
            type: "ETF de Mercados Emergentes",
            percentage: 25,
            amount: amount * 0.25,
            entryPrice: 42.00,
            estimatedShares: Math.floor((amount * 0.25) / 42.00),
            riskLevel: "riesgoso",
            rationale: "Mercado emergente con fuerte crecimiento demográfico y expansión tecnológica.",
            elliottWaveAnalysis: "Onda 5 extendida según Elliott Wave. Entrada en $42 con momentum alcista sostenido."
          },
          {
            name: "ETF ARK Innovation",
            ticker: "ARKK",
            type: "ETF Sectorial de Tecnología",
            percentage: 20,
            amount: amount * 0.2,
            entryPrice: 55.00,
            estimatedShares: Math.floor((amount * 0.2) / 55.00),
            riskLevel: "riesgoso",
            rationale: "Enfoque en innovación disruptiva con alto potencial de crecimiento pero alta volatilidad.",
            elliottWaveAnalysis: "Onda correctiva compleja según Elliott Wave. Entrada en $55 aprovecha la formación de nueva onda impulsiva."
          },
          {
            name: "ETF iShares MSCI South Africa",
            ticker: "EZA",
            type: "ETF de Mercados Emergentes",
            percentage: 15,
            amount: amount * 0.15,
            entryPrice: 48.00,
            estimatedShares: Math.floor((amount * 0.15) / 48.00),
            riskLevel: "riesgoso",
            rationale: "Exposición a economía emergente con sectores minero y financiero de alto potencial.",
            elliottWaveAnalysis: "Onda 4 completada según Elliott Wave. Entrada en $48 con inicio de Onda 5 impulsiva."
          },
          {
            name: "ETF S&P 500",
            ticker: "SPY",
            type: "ETF de Acciones",
            percentage: 15,
            amount: amount * 0.15,
            entryPrice: 420.00,
            estimatedShares: Math.floor((amount * 0.15) / 420.00),
            riskLevel: "moderado",
            rationale: "Ancla de estabilidad en portafolio de alto riesgo. Diversificación necesaria.",
            elliottWaveAnalysis: "Onda 3 en desarrollo según Elliott Wave. Entrada en $420 con soporte técnico fuerte."
          }
        ]
      }
    }

    const allocations = calculateAllocation()

      const mockResponse = {
        strategy: {
          description: `Estrategia optimizada para perfil ${riskProfileSpanish} con horizonte de inversión de 1-3 años. Combina activos de diferentes niveles de riesgo para maximizar retornos ajustados al riesgo.`,
          horizon: "1-3 años"
        },
        assets: allocations
      }

      return NextResponse.json(mockResponse)
    }

  } catch (error) {
    console.error("Error generating allocation:", error)
    return NextResponse.json(
      { error: "Error al generar la estrategia de asignación. Por favor, intenta nuevamente." },
      { status: 500 }
    )
  }
}

