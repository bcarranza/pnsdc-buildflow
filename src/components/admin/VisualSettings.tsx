'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Check, Settings, Mountain, Flame, Church, Flower2, Crown, Grid3X3 } from 'lucide-react'
import { toast } from 'sonner'
import { PROGRESS_VISUAL_OPTIONS, ProgressVisualType } from '@/components/progress'

interface VisualSettingsProps {
  open: boolean
  onClose: () => void
}

const VISUAL_ICONS: Record<ProgressVisualType, React.ComponentType<{ className?: string }>> = {
  mountain: Mountain,
  candle: Flame,
  church: Church,
  roses: Flower2,
  crown: Crown,
  stained_glass: Grid3X3,
}

export default function VisualSettings({ open, onClose }: VisualSettingsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [currentVisual, setCurrentVisual] = useState<ProgressVisualType>('mountain')
  const [selectedVisual, setSelectedVisual] = useState<ProgressVisualType>('mountain')

  // Fetch current setting
  useEffect(() => {
    if (!open) return

    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/settings')
        const data = await response.json()

        if (data.success && data.settings.progress_visual) {
          const visual = data.settings.progress_visual as ProgressVisualType
          setCurrentVisual(visual)
          setSelectedVisual(visual)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [open])

  // Handle save
  const handleSave = async () => {
    if (selectedVisual === currentVisual) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'progress_visual',
          value: selectedVisual,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Visual actualizado', {
          description: 'El nuevo indicador de progreso se mostrará en la página principal.',
        })
        setCurrentVisual(selectedVisual)
        onClose()
      } else {
        toast.error('Error', { description: data.error })
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      toast.error('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración Visual
          </DialogTitle>
          <DialogDescription>
            Seleccione el indicador de progreso que se mostrará en la página principal.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-carmelite-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              Indicador de Progreso
            </Label>

            <div className="grid grid-cols-2 gap-3">
              {PROGRESS_VISUAL_OPTIONS.map((option) => {
                const Icon = VISUAL_ICONS[option.value]
                const isSelected = selectedVisual === option.value
                const isCurrent = currentVisual === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedVisual(option.value)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all text-left
                      ${isSelected
                        ? 'border-carmelite-500 bg-carmelite-50 shadow-md'
                        : 'border-gray-200 hover:border-carmelite-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Current indicator */}
                    {isCurrent && (
                      <span className="absolute top-2 right-2 text-xs text-carmelite-600 font-medium bg-carmelite-100 px-2 py-0.5 rounded-full">
                        Actual
                      </span>
                    )}

                    {/* Selection checkmark */}
                    {isSelected && (
                      <div className="absolute bottom-2 right-2">
                        <Check className="w-5 h-5 text-carmelite-500" />
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected ? 'bg-carmelite-500 text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isSelected ? 'text-carmelite-700' : 'text-gray-900'}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-carmelite-500 hover:bg-carmelite-600"
                onClick={handleSave}
                disabled={isSaving || selectedVisual === currentVisual}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
