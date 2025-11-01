"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Bell, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface InvestmentSimulationProps {
  investmentData: {
    amount: number
    riskProfile: "conservative" | "moderate" | "risky"
  }
  onBack: () => void
}

interface AssetAllocation {
  name: string
  ticker: string
  type?: string
  amount: number
  percentage: number
  estimatedShares: number
  entryPrice: number
  riskLevel?: string
  rationale?: string
  elliottWaveAnalysis?: string
}

interface AllocationResponse {
  strategy: {
    description: string
    horizon: string
  }
  assets: Array<{
    name: string
    ticker: string
    type: string
    percentage: number
    amount: number
    entryPrice: number
    estimatedShares: number
    riskLevel: string
    rationale: string
    elliottWaveAnalysis: string
  }>
}

export function InvestmentSimulation({ investmentData, onBack }: InvestmentSimulationProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allocation, setAllocation] = useState<AllocationResponse | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<AssetAllocation | null>(null)
  const [emailAlerts, setEmailAlerts] = useState(false)
  const [whatsappAlerts, setWhatsappAlerts] = useState(false)

  useEffect(() => {
    const fetchAllocation = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/allocation", {
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
          throw new Error(errorData.error || "Error al generar la estrategia de asignación")
        }

        const data = await response.json()
        setAllocation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchAllocation()
  }, [investmentData.amount, investmentData.riskProfile])

  const handleConfigureAlarm = (asset: AssetAllocation) => {
    setSelectedAsset(asset)
  }

  const handleCloseDialog = () => {
    setSelectedAsset(null)
    setEmailAlerts(false)
    setWhatsappAlerts(false)
  }

  const handleActivateAlarms = () => {
    // Here you would implement the actual alarm activation logic
    console.log("[v0] Activating alarms for", selectedAsset?.name, {
      email: emailAlerts,
      whatsapp: whatsappAlerts,
      targetPrice: selectedAsset?.entryPrice,
    })
    handleCloseDialog()
  }

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            Volver a Recomendaciones
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 md:py-24">
          <Spinner className="h-8 w-8 md:h-12 md:w-12 mb-4" />
          <p className="text-sm md:text-base text-muted-foreground">Generando estrategia de asignación optimizada...</p>
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
            Volver a Recomendaciones
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

  const allocations: AssetAllocation[] = allocation?.assets || []

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2 self-start">
          <ArrowLeft className="h-4 w-4" />
          Volver a Recomendaciones
        </Button>
        <div className="text-left sm:text-right">
          <p className="text-xs md:text-sm text-muted-foreground">Capital total</p>
          <p className="text-xl md:text-2xl font-bold text-foreground">${investmentData.amount.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-1 md:space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Simulación de Inversión</h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Estrategia optimizada para perfil{" "}
          <span className="font-semibold text-foreground capitalize">
            {investmentData.riskProfile === "risky"
              ? "Riesgoso"
              : investmentData.riskProfile === "moderate"
                ? "Moderado"
                : "Conservador"}
          </span>
          {" • "}
          Horizonte: {allocation?.strategy?.horizon || "1-3 años"}
        </p>
      </div>

      {allocation?.strategy?.description && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Estrategia de Inversión</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {allocation.strategy.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Distribución de Activos (5 Activos)</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Asignación optimizada basada en análisis fundamental, técnico y ondas de Elliott
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {allocations.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No se encontraron activos asignados</p>
          )}
          {allocations.map((asset, index) => (
            <div key={index} className="space-y-3 md:space-y-4 pb-4 md:pb-6 border-b last:border-b-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                <div className="flex-1 space-y-2 md:space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm md:text-base">{asset.name}</h3>
                    <span className="text-xs md:text-sm text-muted-foreground">({asset.ticker})</span>
                    {asset.type && (
                      <Badge variant="secondary" className="text-xs">
                        {asset.type}
                      </Badge>
                    )}
                    {asset.riskLevel && (
                      <Badge
                        variant={
                          asset.riskLevel === "riesgoso"
                            ? "destructive"
                            : asset.riskLevel === "moderado"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {asset.riskLevel.charAt(0).toUpperCase() + asset.riskLevel.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Asignación</p>
                      <p className="font-semibold text-foreground text-sm md:text-base">{asset.percentage}%</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Monto a invertir</p>
                      <p className="font-semibold text-foreground text-sm md:text-base">
                        ${asset.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Precio de entrada</p>
                      <p className="font-semibold text-foreground text-sm md:text-base">${asset.entryPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Acciones estimadas</p>
                      <p className="font-semibold text-foreground text-sm md:text-base">{asset.estimatedShares}</p>
                    </div>
                  </div>
                  {asset.rationale && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={`rationale-${index}`} className="border-none">
                        <AccordionTrigger className="text-xs md:text-sm py-2">
                          Ver justificación de la asignación
                        </AccordionTrigger>
                        <AccordionContent className="text-xs md:text-sm text-muted-foreground">
                          {asset.rationale}
                        </AccordionContent>
                      </AccordionItem>
                      {asset.elliottWaveAnalysis && (
                        <AccordionItem value={`elliott-${index}`} className="border-none">
                          <AccordionTrigger className="text-xs md:text-sm py-2">
                            Ver análisis de ondas de Elliott
                          </AccordionTrigger>
                          <AccordionContent className="text-xs md:text-sm text-muted-foreground">
                            {asset.elliottWaveAnalysis}
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-10 w-10 md:h-12 md:w-12 bg-transparent self-start sm:self-auto"
                  onClick={() => handleConfigureAlarm(asset)}
                >
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={selectedAsset !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Configurar Alarma de Precio</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Recibe notificaciones cuando {selectedAsset?.name} alcance el precio de entrada estimado de $
              {selectedAsset?.entryPrice}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="email-alerts" className="text-sm md:text-base font-medium">
                  Alertas por Email
                </Label>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Recibe notificaciones en tu correo electrónico
                </p>
              </div>
              <Switch id="email-alerts" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="whatsapp-alerts" className="text-sm md:text-base font-medium">
                  Alertas por WhatsApp
                </Label>
                <p className="text-xs md:text-sm text-muted-foreground">Recibe alertas instantáneas en WhatsApp</p>
              </div>
              <Switch id="whatsapp-alerts" checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
            </div>

            <Button
              className="w-full text-sm md:text-base"
              size="lg"
              disabled={!emailAlerts && !whatsappAlerts}
              onClick={handleActivateAlarms}
            >
              Activar Alarma
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
