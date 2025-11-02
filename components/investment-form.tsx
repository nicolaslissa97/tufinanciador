"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Shield, Zap, Globe, Clock } from "lucide-react"

interface InvestmentFormProps {
  onSubmit: (data: {
    country: string
    amount: number
    timeframe: "short" | "medium" | "long"
    riskProfile: "conservative" | "moderate" | "risky"
  }) => void
}

export function InvestmentForm({ onSubmit }: InvestmentFormProps) {
  const [country, setCountry] = useState<string | undefined>(undefined)
  const [amount, setAmount] = useState<string>("")
  const [timeframe, setTimeframe] = useState<"short" | "medium" | "long" | undefined>(undefined)
  const [riskProfile, setRiskProfile] = useState<"conservative" | "moderate" | "risky">("moderate")

  const timeframeLabels = {
    short: "Corto Plazo",
    medium: "Mediano Plazo",
    long: "Largo Plazo",
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🔍 Datos actuales del formulario:")
    console.log({ country, amount, timeframe, riskProfile })

    if (!country) {
      alert("Por favor selecciona tu país de origen.")
      return
    }

    if (!timeframe) {
      alert("Por favor selecciona un plazo de inversión.")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      alert("Por favor ingresa un monto válido.")
      return
    }

    onSubmit({
      country,
      amount: Number.parseFloat(amount),
      timeframe,
      riskProfile,
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 md:mb-8 text-center px-4">
        <h2 className="text-2xl font-bold text-foreground md:text-4xl">
          Comienza tu viaje de inversión
        </h2>
        <p className="mt-2 md:mt-3 text-base md:text-lg text-muted-foreground">
          Ingresa tu capital y perfil de riesgo para recibir recomendaciones personalizadas
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Datos de Inversión</CardTitle>
          <CardDescription>
            Completa la información para generar tu portafolio recomendado
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {/* País de origen */}
            <div className="space-y-2">
              <Label htmlFor="country">País de Origen</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="pl-9 text-base h-11">
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      ["AR", "Argentina"],
                      ["BO", "Bolivia"],
                      ["BR", "Brasil"],
                      ["CL", "Chile"],
                      ["CO", "Colombia"],
                      ["CR", "Costa Rica"],
                      ["EC", "Ecuador"],
                      ["SV", "El Salvador"],
                      ["ES", "España"],
                      ["US", "Estados Unidos"],
                      ["GT", "Guatemala"],
                      ["HN", "Honduras"],
                      ["MX", "México"],
                      ["NI", "Nicaragua"],
                      ["PA", "Panamá"],
                      ["PY", "Paraguay"],
                      ["PE", "Perú"],
                      ["DO", "República Dominicana"],
                      ["UY", "Uruguay"],
                      ["VE", "Venezuela"],
                    ].map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Monto a invertir */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Invertir</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 text-base h-11"
                  min="0"
                  step="100"
                />
              </div>
            </div>

            {/* Plazo de inversión */}
            <div className="space-y-2">
              <Label htmlFor="timeframe">Plazo de Inversión</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Select value={timeframe} onValueChange={(val) => setTimeframe(val as "short" | "medium" | "long")}>
                  <SelectTrigger className="pl-9 text-base h-11">
                    <SelectValue placeholder="Selecciona el plazo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">
                      <div className="flex flex-col">
                        <span className="font-medium">Corto Plazo</span>
                        <span className="text-xs text-muted-foreground">6 meses - 1 año</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex flex-col">
                        <span className="font-medium">Mediano Plazo</span>
                        <span className="text-xs text-muted-foreground">1.5 - 3 años</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="long">
                      <div className="flex flex-col">
                        <span className="font-medium">Largo Plazo</span>
                        <span className="text-xs text-muted-foreground">3+ años</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Perfil de inversor */}
            <div className="space-y-3">
              <Label>Perfil de Inversor</Label>
              <RadioGroup
                value={riskProfile}
                onValueChange={(val) =>
                  setRiskProfile(val as "conservative" | "moderate" | "risky")
                }
                className="grid gap-3"
              >
                <div className="relative">
                  <RadioGroupItem value="conservative" id="conservative" className="peer sr-only" />
                  <Label
                    htmlFor="conservative"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-card p-3 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-1/10">
                      <Shield className="h-4 w-4 text-chart-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">Conservador</div>
                      <div className="text-xs text-muted-foreground">
                        Prioriza la seguridad y estabilidad. Menor riesgo, retornos moderados.
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="moderate" id="moderate" className="peer sr-only" />
                  <Label
                    htmlFor="moderate"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-card p-3 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-2/10">
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">Moderado</div>
                      <div className="text-xs text-muted-foreground">
                        Balance entre riesgo y retorno. Diversificación equilibrada.
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="risky" id="risky" className="peer sr-only" />
                  <Label
                    htmlFor="risky"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border-2 border-border bg-card p-3 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-5/10">
                      <Zap className="h-4 w-4 text-chart-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">Riesgoso</div>
                      <div className="text-xs text-muted-foreground">
                        Busca máximos retornos. Mayor volatilidad y riesgo.
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" size="lg" className="w-full h-11">
              Generar Recomendaciones
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
