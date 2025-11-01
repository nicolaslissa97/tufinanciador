"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, BarChart3, FileText } from "lucide-react"

interface Asset {
  name: string
  fundamentalAnalysis: string
  technicalAnalysis: string
  entryPrice: string
  exitPrice: string
  riskLevel: "low" | "moderate" | "high"
}

interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 md:gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-foreground">{asset.name}</h3>
              <Badge variant="secondary" className="mt-1.5 md:mt-2 text-xs">
                {asset.riskLevel === "low"
                  ? "Bajo Riesgo"
                  : asset.riskLevel === "moderate"
                    ? "Riesgo Moderado"
                    : "Alto Riesgo"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Precio de Entrada Estimado
              </div>
              <p className="text-lg md:text-xl font-bold text-accent">{asset.entryPrice}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Precio de Salida Estimado
              </div>
              <p className="text-lg md:text-xl font-bold text-accent">{asset.exitPrice}</p>
            </div>
          </div>

          <div className="space-y-2.5 md:space-y-3">
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-foreground">
                <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Análisis Fundamental
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{asset.fundamentalAnalysis}</p>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-foreground">
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Análisis Técnico (Ondas de Elliott)
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{asset.technicalAnalysis}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
