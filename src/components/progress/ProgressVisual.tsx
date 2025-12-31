'use client'

import { ProgressVisualProps, ProgressVisualType } from './types'
import { MountCarmel } from './MountCarmel'
import { VotiveCandle } from './VotiveCandle'
import { ChurchBuilding } from './ChurchBuilding'
import { RoseGarden } from './RoseGarden'
import { CrownOfStars } from './CrownOfStars'
import { StainedGlass } from './StainedGlass'

interface ProgressVisualSelectorProps extends ProgressVisualProps {
  visualType: ProgressVisualType
}

const visualComponents: Record<ProgressVisualType, React.ComponentType<ProgressVisualProps>> = {
  mountain: MountCarmel,
  candle: VotiveCandle,
  church: ChurchBuilding,
  roses: RoseGarden,
  crown: CrownOfStars,
  stained_glass: StainedGlass,
}

export function ProgressVisual({
  visualType,
  currentAmount,
  goalAmount,
  className = '',
}: ProgressVisualSelectorProps) {
  const Component = visualComponents[visualType] || MountCarmel

  return (
    <Component
      currentAmount={currentAmount}
      goalAmount={goalAmount}
      className={className}
    />
  )
}
