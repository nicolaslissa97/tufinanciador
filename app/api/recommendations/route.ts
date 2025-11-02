import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, riskProfile, country, timeframe } = await request.json()

    console.log("amount", amount)
    console.log("riskProfile", riskProfile)
    console.log("country", country)
    console.log("timeframe", timeframe)

    if (!amount || !riskProfile || !country || !timeframe ) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Mapear perfil a español para el prompt
    const riskProfileMap: Record<string, string> = {
      conservative: "Conservador",
      moderate: "Moderado",
      risky: "Riesgoso",
    }

    const timeframeMap: Record<string, string> = {
      short: "6 meses - 1 año",
      medium: "1.5 años - 3 años",
      long: "3 años o más",
    }

    const riskProfileSpanish = riskProfileMap[riskProfile] || riskProfile
    const timeframeSpanish = timeframeMap[timeframe] || timeframe

    // Construir el prompt según las especificaciones
    const systemPrompt = `Eres un Asesor Financiero con conocimientos avanzados en análisis técnico y en el uso de la teoría de las ondas de Elliott (Elliott Wave Theory).

Tu tarea es realizar un análisis de activos financieros atractivos para un inversor con perfil ${riskProfileSpanish} 
y su pais de residencia ${country} considerando que no puede comprar bonos de otros paises ni ETFS
, considerando:

1. Flujo de dinero de las empresas
2. Riesgo país (análisis de riesgo macroeconómico, factores políticos, sociales, etc.)
3. Eventos económicos futuros que puedan generar un crecimiento económico relevante en el país
4. Valor en libros de los activos (valor contable)
5. Presentación de balances financieros
6. Análisis técnico de gráficos (enfoque basado en ondas de Elliott)

IMPORTANTE:
- NO incluyas criptomonedas en la respuesta
- Clasifica los activos en tres categorías: poco riesgo, riesgo moderado, y más riesgo
- Para los activos con más riesgo, segmenta entre activos de mercados emergentes y no emergentes
- Para cada categoría, recomienda el mejor activo según tu análisis integral
- Proporciona precios de entrada y salida para cada activo

Estructura tu respuesta en formato JSON con el siguiente esquema:
{
  "${riskProfile}": {
    "assets": [{
      "name": "Nombre del activo",
      "ticker": "Símbolo",
      "type": "Tipo de Activo",
      "fundamentalAnalysis": "Análisis fundamental detallado",
      "technicalAnalysis": "Análisis técnico con ondas de Elliott",
      "entryPrice": "Precio de entrada",
      "exitPrice": "Precio de salida"
    }]
  }
}

En caso de ser highRisk retornarlo de la siguiente manera:
{
 "highRisk": {
    "emergingMarkets": [{
      "name": "Nombre del activo",
      "ticker": "Símbolo",
      "type": "Tipo de Activo",
      "fundamentalAnalysis": "Análisis fundamental detallado",
      "technicalAnalysis": "Análisis técnico con ondas de Elliott",
      "entryPrice": "Precio de entrada",
      "exitPrice": "Precio de salida"
    }],
    "nonEmergingMarkets": [{
      "name": "Nombre del activo",
      "ticker": "Símbolo",
      "type": "Tipo de Activo",
      "fundamentalAnalysis": "Análisis fundamental detallado",
      "technicalAnalysis": "Análisis técnico con ondas de Elliott",
      "entryPrice": "Precio de entrada",
      "exitPrice": "Precio de salida"
    }]
  }
}

Responde SOLO con el JSON, sin texto adicional.`

    const userPrompt = `El inversor tiene un perfil ${riskProfileSpanish} y un monto de inversión de $${amount.toLocaleString()}. 
    El horizonte de inversión es de ${timeframeSpanish}
    Genera recomendaciones de activos financieros apropiados para este perfil y horizonte de inversión,
    no debemos incluir criptomonedas ni tampoco ETFs solo activos que sean operables en el pais del inversor ${country}`

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
      const mockResponse = {
        lowRisk: {
        assets: [
          {
            name: "Bonos del Tesoro de EE.UU. a 10 años",
            ticker: "TLT",
            type: "ETF de Bonos",
            fundamentalAnalysis: "Bajo riesgo país, estabilidad financiera excepcional, respaldado por el gobierno de EE.UU. Flujo de dinero positivo, excelente calificación crediticia AAA. Eventos económicos futuros sugieren estabilidad en tasas de interés.",
            technicalAnalysis: "Onda 2 completada según Elliott Wave, expectativa de corrección hacia Onda 4. Tendencia alcista consolidada con soporte fuerte en niveles actuales. MACD muestra convergencia alcista.",
            entryPrice: "$98.50",
            exitPrice: "$102.00"
          },
          {
            name: "ETF S&P 500",
            ticker: "SPY",
            type: "ETF de Acciones",
            fundamentalAnalysis: "Diversificación en 500 empresas líderes estadounidenses. Historial sólido de crecimiento a largo plazo. Valor en libros favorable, balances financieros robustos. Baja volatilidad relativa para un índice de acciones.",
            technicalAnalysis: "Onda 3 en desarrollo según Elliott Wave, soporte fuerte en niveles actuales. Indicadores técnicos muestran momentum positivo. RSI en zona neutral con tendencia alcista.",
            entryPrice: "$420.00",
            exitPrice: "$460.00"
          }
        ]
      },
      moderateRisk: {
        assets: [
          {
            name: "Acciones de Apple Inc.",
            ticker: "AAPL",
            type: "Acción",
            fundamentalAnalysis: "Flujo de caja positivo consistente, expansión en servicios de alta rentabilidad. Exposición internacional diversificada. Ecosistema robusto y base de clientes leales. Valor en libros favorable, balances financieros excepcionales.",
            technicalAnalysis: "Onda 4 en desarrollo, posible inicio de Onda 5 según Elliott Wave. RSI en zona neutral, MACD muestra convergencia alcista. Soporte técnico en $165.",
            entryPrice: "$165.00",
            exitPrice: "$200.00"
          },
          {
            name: "Acciones de Microsoft Corporation",
            ticker: "MSFT",
            type: "Acción",
            fundamentalAnalysis: "Liderazgo en cloud computing (Azure), IA y software empresarial. Márgenes de ganancia consistentes y crecimiento sostenido. Flujo de caja libre fuerte, excelentes balances financieros.",
            technicalAnalysis: "Onda 5 en progreso según Elliott Wave, resistencia en $420. Volumen creciente indica interés institucional. Momentum alcista sostenido.",
            entryPrice: "$380.00",
            exitPrice: "$420.00"
          }
        ]
      },
      highRisk: {
        emergingMarkets: [
          {
            name: "ETF iShares MSCI Brazil Test",
            ticker: "EWZ",
            type: "ETF de Mercados Emergentes",
            fundamentalAnalysis: "Exposición a mercado brasileño con sectores de commodities y financiero. Economía emergente con alto potencial de crecimiento pero volatilidad significativa. Riesgo país moderado con reformas económicas en curso.",
            technicalAnalysis: "Onda 3 en progreso según Elliott Wave, posibilidad de corrección hacia Onda 4. Niveles de Fibonacci sugieren soporte en $28. Volatilidad alta típica de mercados emergentes.",
            entryPrice: "$28.50",
            exitPrice: "$36.00"
          },
          {
            name: "ETF iShares MSCI India",
            ticker: "INDA",
            type: "ETF de Mercados Emergentes",
            fundamentalAnalysis: "Mercado emergente con fuerte crecimiento demográfico y expansión tecnológica. Reformas económicas en curso, pero riesgo regulatorio presente. Alto potencial de crecimiento a largo plazo.",
            technicalAnalysis: "Onda 5 extendida según Elliott Wave, momentum alcista sostenido. RSI en zona de sobrecompra sugiere posible consolidación. Tendencia alcista a largo plazo intacta.",
            entryPrice: "$42.00",
            exitPrice: "$52.00"
          }
        ],
        nonEmergingMarkets: [
          {
            name: "ETF de Tecnología ARK Innovation",
            ticker: "ARKK",
            type: "ETF Sectorial",
            fundamentalAnalysis: "Enfoque en empresas de innovación disruptiva. Alto potencial de crecimiento pero alta volatilidad. Flujo de dinero variable dependiendo del ciclo de mercado. Análisis de riesgo país favorable (EE.UU.).",
            technicalAnalysis: "Onda correctiva compleja según Elliott Wave, posible formación de nueva onda impulsiva. Volatilidad alta, soportes y resistencias dinámicos.",
            entryPrice: "$55.00",
            exitPrice: "$72.00"
          }
        ]
      }
    }
      
    return NextResponse.json(mockResponse)
    }

  } catch (error) {
    console.error("Error generating recommendations:", error)
    return NextResponse.json(
      { error: "Error al generar recomendaciones. Por favor, intenta nuevamente." },
      { status: 500 }
    )
  }
}

