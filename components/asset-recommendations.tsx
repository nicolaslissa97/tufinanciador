"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetCard } from "@/components/asset-card"
import { ArrowLeft, Shield, TrendingUp, Zap, Calculator, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

interface Asset {
  name: string
  ticker?: string
  type?: string
  fundamentalAnalysis: string
  technicalAnalysis: string
  entryPrice: string
  exitPrice: string
  riskLevel: "low" | "moderate" | "high"
}

interface APIResponse {
  lowRisk: {
    assets: Array<{
      name: string
      ticker: string
      type: string
      fundamentalAnalysis: string
      technicalAnalysis: string
      entryPrice: string
      exitPrice: string
    }>
  }
  moderateRisk: {
    assets: Array<{
      name: string
      ticker: string
      type: string
      fundamentalAnalysis: string
      technicalAnalysis: string
      entryPrice: string
      exitPrice: string
    }>
  }
  highRisk: {
    emergingMarkets: Array<{
      name: string
      ticker: string
      type: string
      fundamentalAnalysis: string
      technicalAnalysis: string
      entryPrice: string
      exitPrice: string
    }>
    nonEmergingMarkets: Array<{
      name: string
      ticker: string
      type: string
      fundamentalAnalysis: string
      technicalAnalysis: string
      entryPrice: string
      exitPrice: string
    }>
  }
}

interface AssetRecommendationsProps {
  investmentData: {
    amount: number
    riskProfile: "conservative" | "moderate" | "risky"
  }
  onBack: () => void
  onSimulate: () => void
}

export function AssetRecommendations({ investmentData, onBack, onSimulate }: AssetRecommendationsProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<APIResponse | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: investmentData.amount,
            riskProfile: investmentData.riskProfile,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al cargar recomendaciones")
        }

        const data = await response.json()
        setRecommendations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [investmentData.amount, investmentData.riskProfile])

  const convertToAsset = (apiAsset: {
    name: string
    ticker?: string
    type?: string
    fundamentalAnalysis: string
    technicalAnalysis: string
    entryPrice: string
    exitPrice: string
  }, riskLevel: "low" | "moderate" | "high"): Asset => {
    return {
      name: apiAsset.name,
      ticker: apiAsset.ticker,
      type: apiAsset.type,
      fundamentalAnalysis: apiAsset.fundamentalAnalysis,
      technicalAnalysis: apiAsset.technicalAnalysis,
      entryPrice: apiAsset.entryPrice,
      exitPrice: apiAsset.exitPrice,
      riskLevel,
    }
  }

  const showLowRisk = investmentData.riskProfile === "conservative"
  const showModerateRisk = investmentData.riskProfile === "moderate"
  const showHighRisk = investmentData.riskProfile === "risky"

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 md:py-24">
          <Spinner className="h-8 w-8 md:h-12 md:w-12 mb-4" />
          <p className="text-sm md:text-base text-muted-foreground">Generando recomendaciones personalizadas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">
          Intentar nuevamente
        </Button>
      </div>
    )
  }

  const lowRiskAssets = recommendations?.lowRisk?.assets?.map((a) => convertToAsset(a, "low")) || []
  const moderateRiskAssets = recommendations?.moderateRisk?.assets?.map((a) => convertToAsset(a, "moderate")) || []
  const highRiskEmergingAssets =
    recommendations?.highRisk?.emergingMarkets?.map((a) => convertToAsset(a, "high")) || []
  const highRiskNonEmergingAssets =
    recommendations?.highRisk?.nonEmergingMarkets?.map((a) => convertToAsset(a, "high")) || []
  const highRiskAssets = [...highRiskEmergingAssets, ...highRiskNonEmergingAssets]

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="text-left sm:text-right">
          <p className="text-xs md:text-sm text-muted-foreground">Capital a invertir</p>
          <p className="text-xl md:text-2xl font-bold text-foreground">${investmentData.amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recomendaciones Personalizadas</h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Basadas en tu perfil{" "}
            <span className="font-semibold text-foreground capitalize">
              {investmentData.riskProfile === "risky"
                ? "Riesgoso"
                : investmentData.riskProfile === "moderate"
                  ? "Moderado"
                  : "Conservador"}
            </span>
          </p>
        </div>
        <Button onClick={onSimulate} size="lg" className="gap-2 w-full lg:w-auto lg:shrink-0">
          <Calculator className="h-5 w-5" />
          Simular Inversión
        </Button>
      </div>

      {/* Low Risk Assets */}
      {showLowRisk && (
        <Card className="border-chart-1/20 bg-chart-1/5">
          <CardHeader>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-chart-1/20">
                <Shield className="h-4 w-4 md:h-5 md:w-5 text-chart-1" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl">Activos con Poco Riesgo</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Inversiones estables y seguras para preservar capital
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {lowRiskAssets.map((asset, index) => (
              <AssetCard key={index} asset={asset} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Moderate Risk Assets */}
      {showModerateRisk && (
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardHeader>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-chart-2/20">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-chart-2" />
              </div>
              <div>
                <CardTitle className="text-lg md:text-xl">Activos con Riesgo Moderado</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Balance entre crecimiento y estabilidad
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            {moderateRiskAssets.map((asset, index) => (
              <AssetCard key={index} asset={asset} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* High Risk Assets */}
      {showHighRisk && (
        <div className="space-y-4 md:space-y-6">
          {/* Emerging Markets */}
          {highRiskEmergingAssets.length > 0 && (
            <Card className="border-chart-5/20 bg-chart-5/5">
              <CardHeader>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-chart-5/20">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-chart-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl">Activos con Más Riesgo - Mercados Emergentes</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Alto potencial de crecimiento en economías emergentes con mayor volatilidad
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {highRiskEmergingAssets.map((asset, index) => (
                  <AssetCard key={`emerging-${index}`} asset={asset} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Non-Emerging Markets */}
          {highRiskNonEmergingAssets.length > 0 && (
            <Card className="border-chart-5/20 bg-chart-5/5">
              <CardHeader>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-chart-5/20">
                    <Zap className="h-4 w-4 md:h-5 md:w-5 text-chart-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg md:text-xl">Activos con Más Riesgo - Otros Mercados</CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Alto potencial de retorno con mayor volatilidad en mercados desarrollados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {highRiskNonEmergingAssets.map((asset, index) => (
                  <AssetCard key={`non-emerging-${index}`} asset={asset} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
