export interface ProgressVisualProps {
  currentAmount: number
  goalAmount: number
  className?: string
}

export type ProgressVisualType =
  | 'mountain'
  | 'candle'
  | 'church'
  | 'roses'
  | 'crown'
  | 'stained_glass'

export const PROGRESS_VISUAL_OPTIONS: { value: ProgressVisualType; label: string; description: string }[] = [
  { value: 'mountain', label: 'Monte Carmelo', description: 'Montaña que se llena de luz dorada' },
  { value: 'candle', label: 'Vela Votiva', description: 'Vela de oración con llama ascendente' },
  { value: 'church', label: 'Iglesia en Construcción', description: 'Capilla que se construye pieza por pieza' },
  { value: 'roses', label: 'Jardín de Rosas', description: 'Rosas que florecen (María = Rosa)' },
  { value: 'crown', label: 'Corona de Estrellas', description: 'Corona de María con 12 estrellas' },
  { value: 'stained_glass', label: 'Vitral', description: 'Ventana de vitral que se llena de color' },
]

export function formatCurrency(amount: number): string {
  return `Q${amount.toLocaleString('es-GT')}`
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `Q${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `Q${(amount / 1000).toFixed(1)}K`
  }
  return `Q${amount.toLocaleString('es-GT')}`
}
