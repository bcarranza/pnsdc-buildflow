'use client'

import { useState, useEffect } from 'react'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'
import { MaterialsList, type Material } from './MaterialsList'
import { DonorWallWithFilters } from './DonorWallWithFilters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProgressVisual, type ProgressVisualType } from '@/components/progress'

interface Donation {
  id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  created_at: string
  material_name?: string | null
}

interface RealtimeDashboardProps {
  initialFundraising: {
    current_amount: number
    goal_amount: number
  }
  initialMaterials: Material[]
  initialDonations: Donation[]
}

export function RealtimeDashboard({
  initialFundraising,
  initialMaterials,
  initialDonations,
}: RealtimeDashboardProps) {
  const [visualType, setVisualType] = useState<ProgressVisualType>('mountain')

  const { data, isConnected, lastUpdated, refresh } = useRealtimeDashboard({
    initialData: {
      fundraising: initialFundraising,
      materials: initialMaterials,
      donations: initialDonations,
    },
  })

  // Fetch site settings for progress visual type
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.success && data.settings?.progress_visual) {
          setVisualType(data.settings.progress_visual as ProgressVisualType)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Connection status indicator */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span>En vivo</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-gray-400" />
              <span>Actualización automática</span>
            </>
          )}
          <span className="text-gray-400">•</span>
          <span>Última: {formatTime(lastUpdated)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          className="h-8 px-2"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Visual Section */}
      <section className="mb-6 md:mb-8" aria-label="Progreso de recaudación">
        <Card className="border-carmelite-200 shadow-sm overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl md:text-2xl text-carmelite-800">
              Meta de Recaudación
            </CardTitle>
            <p className="text-gray-600">Para julio 2025</p>
          </CardHeader>
          <CardContent className="py-6">
            <ProgressVisual
              visualType={visualType}
              currentAmount={data.fundraising.current_amount}
              goalAmount={data.fundraising.goal_amount}
            />
          </CardContent>
        </Card>
      </section>

      {/* Materials Section */}
      <section className="mb-6 md:mb-8" aria-label="Lista de materiales">
        <Card className="border-carmelite-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-carmelite-800">
              Materiales de Construcción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MaterialsList materials={data.materials} />
          </CardContent>
        </Card>
      </section>

      {/* Donor Wall Section with Filters */}
      <section className="mb-6 md:mb-8" aria-label="Muro de donantes">
        <Card className="border-carmelite-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-carmelite-800">
              Muro de Donantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonorWallWithFilters
              donations={data.donations}
              materials={data.materials}
            />
          </CardContent>
        </Card>
      </section>
    </>
  )
}
