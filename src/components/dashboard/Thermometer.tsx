'use client'

import { useEffect, useState } from 'react'

interface ThermometerProps {
  currentAmount: number
  goalAmount: number
  className?: string
}

function formatCurrency(amount: number): string {
  return `Q${amount.toLocaleString('es-GT')}`
}

export function Thermometer({ currentAmount, goalAmount, className = '' }: ThermometerProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="progressbar"
      aria-valuenow={currentAmount}
      aria-valuemin={0}
      aria-valuemax={goalAmount}
      aria-label={`Progreso de recaudación: ${displayPercentage}% alcanzado, ${formatCurrency(currentAmount)} de ${formatCurrency(goalAmount)}`}
    >
      {/* Amount Display */}
      <div className="text-center mb-4">
        <div className="text-4xl md:text-5xl font-bold text-amber-600">
          {formatCurrency(currentAmount)}
        </div>
        <div className="text-gray-500 mt-1">
          de {formatCurrency(goalAmount)}
        </div>
      </div>

      {/* Thermometer SVG */}
      <div className="relative w-24 h-64 md:w-28 md:h-72">
        <svg
          viewBox="0 0 100 280"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Thermometer outline */}
          <defs>
            <clipPath id="thermometer-clip">
              {/* Tube */}
              <rect x="30" y="20" width="40" height="180" rx="20" />
              {/* Bulb */}
              <circle cx="50" cy="230" r="40" />
            </clipPath>
          </defs>

          {/* Background */}
          <g clipPath="url(#thermometer-clip)">
            <rect x="0" y="0" width="100" height="280" className="fill-amber-100" />
          </g>

          {/* Fill - animated */}
          <g clipPath="url(#thermometer-clip)">
            {/* Bulb fill (always full) */}
            <circle cx="50" cy="230" r="40" className="fill-amber-500" />
            {/* Tube fill */}
            <rect
              x="30"
              y={200 - (animatedPercentage / 100) * 180}
              width="40"
              height={(animatedPercentage / 100) * 180 + 30}
              className="fill-amber-500 transition-all duration-1000 ease-out"
            />
          </g>

          {/* Thermometer border */}
          <path
            d="M50 20
               C63 20 70 27 70 40
               L70 180
               C70 185 72 188 75 192
               C88 205 90 215 90 230
               C90 252 72 270 50 270
               C28 270 10 252 10 230
               C10 215 12 205 25 192
               C28 188 30 185 30 180
               L30 40
               C30 27 37 20 50 20 Z"
            className="fill-none stroke-amber-600 stroke-2"
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => (
            <g key={tick}>
              <line
                x1="72"
                y1={200 - (tick / 100) * 180}
                x2="82"
                y2={200 - (tick / 100) * 180}
                className="stroke-amber-600 stroke-1"
              />
              <text
                x="88"
                y={204 - (tick / 100) * 180}
                className="fill-amber-700 text-xs"
                fontSize="10"
              >
                {tick}%
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Percentage Display */}
      <div className="mt-4 text-center">
        <span className="text-2xl md:text-3xl font-bold text-amber-600">
          {displayPercentage}%
        </span>
        <span className="text-gray-600 ml-2">
          alcanzado
        </span>
      </div>
    </div>
  )
}
