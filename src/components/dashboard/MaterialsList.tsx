import { Progress } from '@/components/ui/progress'
import { Check } from 'lucide-react'

export interface Material {
  id: string
  name: string
  unit: string
  quantity_needed: number
  quantity_current: number
}

interface MaterialItemProps {
  material: Material
}

function MaterialItem({ material }: MaterialItemProps) {
  const { name, unit, quantity_needed, quantity_current } = material
  const percentage = Math.min((quantity_current / quantity_needed) * 100, 100)
  const isCompleted = percentage >= 100

  return (
    <div
      className={`p-4 rounded-lg border ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-carmelite-100'
      }`}
      role="listitem"
      aria-label={`${name}: ${quantity_current} de ${quantity_needed} ${unit}, ${Math.round(percentage)}% completado`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-h-[48px]">
          {isCompleted && (
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
          )}
          <h3 className={`text-base md:text-lg font-medium ${
            isCompleted ? 'text-green-700' : 'text-gray-800'
          }`}>
            {name}
          </h3>
        </div>
      </div>

      <div className={`text-sm md:text-base mb-3 ${
        isCompleted ? 'text-green-600' : 'text-gray-600'
      }`}>
        {isCompleted ? (
          <span className="font-medium">¡Completado! - {quantity_current} de {quantity_needed} {unit}</span>
        ) : (
          <span>{quantity_current} de {quantity_needed} {unit}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={percentage}
          className={`h-3 flex-1 ${isCompleted ? '[&>div]:bg-green-500' : '[&>div]:bg-carmelite-500'}`}
          aria-label={`${Math.round(percentage)}% completado`}
        />
        <span className={`text-sm font-medium min-w-[45px] text-right ${
          isCompleted ? 'text-green-600' : 'text-carmelite-600'
        }`}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}

interface MaterialsListProps {
  materials: Material[]
}

export function MaterialsList({ materials }: MaterialsListProps) {
  // Sort by completion percentage (lowest first = most needed)
  const sortedMaterials = [...materials].sort((a, b) => {
    const percentA = (a.quantity_current / a.quantity_needed) * 100
    const percentB = (b.quantity_current / b.quantity_needed) * 100
    return percentA - percentB
  })

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay materiales registrados.</p>
      </div>
    )
  }

  return (
    <div
      className="space-y-3"
      role="list"
      aria-label="Lista de materiales de construcción"
    >
      {sortedMaterials.map((material) => (
        <MaterialItem key={material.id} material={material} />
      ))}
    </div>
  )
}
