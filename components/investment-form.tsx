"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DollarSign, TrendingUp, Shield, Zap } from "lucide-react"

interface InvestmentFormProps {
  onSubmit: (data: {
    amount: number
    riskProfile: "conservative" | "moderate" | "risky"
  }) => void
}

export function InvestmentForm({ onSubmit }: InvestmentFormProps) {
  const [amount, setAmount] = useState("")
  const [riskProfile, setRiskProfile] = useState<"conservative" | "moderate" | "risky">("moderate")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (amount && Number.parseFloat(amount) > 0) {
      onSubmit({
        amount: Number.parseFloat(amount),
        riskProfile,
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 md:mb-8 text-center px-4">
        <h2 className="text-2xl font-bold text-foreground md:text-4xl text-balance">Comienza tu viaje de inversión</h2>
        <p className="mt-2 md:mt-3 text-base md:text-lg text-muted-foreground text-pretty">
          Ingresa tu capital y perfil de riesgo para recibir recomendaciones personalizadas
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Datos de Inversión</CardTitle>
          <CardDescription>Completa la información para generar tu portafolio recomendado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="amount" className="text-sm md:text-base font-medium">
                Monto a Invertir
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 md:h-5 md:w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 md:pl-10 text-base md:text-lg h-11 md:h-12"
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <Label className="text-sm md:text-base font-medium">Perfil de Inversor</Label>
              <RadioGroup
                value={riskProfile}
                onValueChange={(value) => setRiskProfile(value as "conservative" | "moderate" | "risky")}
                className="grid gap-3 md:gap-4"
              >
                <div className="relative">
                  <RadioGroupItem value="conservative" id="conservative" className="peer sr-only" />
                  <Label
                    htmlFor="conservative"
                    className="flex cursor-pointer items-start gap-3 md:gap-4 rounded-lg border-2 border-border bg-card p-3 md:p-4 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-chart-1/10">
                      <Shield className="h-4 w-4 md:h-5 md:w-5 text-chart-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm md:text-base">Conservador</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Prioriza la seguridad y estabilidad. Menor riesgo, retornos moderados.
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="moderate" id="moderate" className="peer sr-only" />
                  <Label
                    htmlFor="moderate"
                    className="flex cursor-pointer items-start gap-3 md:gap-4 rounded-lg border-2 border-border bg-card p-3 md:p-4 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                      <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-chart-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm md:text-base">Moderado</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Balance entre riesgo y retorno. Diversificación equilibrada.
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem value="risky" id="risky" className="peer sr-only" />
                  <Label
                    htmlFor="risky"
                    className="flex cursor-pointer items-start gap-3 md:gap-4 rounded-lg border-2 border-border bg-card p-3 md:p-4 transition-all hover:bg-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10"
                  >
                    <div className="flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
                      <Zap className="h-4 w-4 md:h-5 md:w-5 text-chart-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm md:text-base">Riesgoso</div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Busca máximos retornos. Mayor volatilidad y riesgo.
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" size="lg" className="w-full text-sm md:text-base h-11 md:h-12">
              Generar Recomendaciones
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
