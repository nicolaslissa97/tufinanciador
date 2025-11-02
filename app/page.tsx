"use client"

import { useState } from "react"
import { InvestmentForm } from "@/components/investment-form"
import { AssetRecommendations } from "@/components/asset-recommendations"
import { InvestmentSimulation } from "@/components/investment-simulation"
import { TrendingUp } from "lucide-react"

type View = "form" | "recommendations" | "simulation"

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("form")
  const [investmentData, setInvestmentData] = useState<{
    country: string
    amount: number
    timeframe: "short" | "medium" | "long"
    riskProfile: "conservative" | "moderate" | "risky"
  } | null>(null)

  const handleGenerateRecommendations = (data: {
    country: string
    amount: number
    timeframe: "short" | "medium" | "long"
    riskProfile: "conservative" | "moderate" | "risky"
  }) => {
    setInvestmentData(data)
    setCurrentView("recommendations")
  }

  const handleBackToForm = () => {
    setCurrentView("form")
  }

  const handleSimulate = () => {
    setCurrentView("simulation")
  }

  const handleBackToRecommendations = () => {
    setCurrentView("recommendations")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-semibold text-foreground">Asesor Financiero</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Inversiones inteligentes a largo plazo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        {currentView === "form" && <InvestmentForm onSubmit={handleGenerateRecommendations} />}
        {currentView === "recommendations" && investmentData && (
          <AssetRecommendations investmentData={investmentData} onBack={handleBackToForm} onSimulate={handleSimulate} />
        )}
        {currentView === "simulation" && investmentData && (
          <InvestmentSimulation investmentData={investmentData} onBack={handleBackToRecommendations} />
        )}
      </main>

      <footer className="border-t border-border bg-card py-4 md:py-6 mt-8 md:mt-12">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-muted-foreground">
          <p>© 2025 Asesor Financiero. Inversiones basadas en análisis técnico y fundamental.</p>
        </div>
      </footer>
    </div>
  )
}
