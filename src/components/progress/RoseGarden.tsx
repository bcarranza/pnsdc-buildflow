'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function RoseGarden({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Roses bloom based on percentage (12 roses for the 12 mysteries)
  const bloomedRoses = Math.floor((animatedPercentage / 100) * 12)

  const rosePositions = [
    { x: 100, y: 50, scale: 1.2 },   // Center top - main rose
    { x: 60, y: 70, scale: 0.9 },    // Left
    { x: 140, y: 70, scale: 0.9 },   // Right
    { x: 40, y: 100, scale: 0.8 },   // Far left
    { x: 160, y: 100, scale: 0.8 },  // Far right
    { x: 80, y: 95, scale: 0.85 },   // Inner left
    { x: 120, y: 95, scale: 0.85 },  // Inner right
    { x: 55, y: 125, scale: 0.75 },  // Bottom left
    { x: 145, y: 125, scale: 0.75 }, // Bottom right
    { x: 100, y: 115, scale: 0.9 },  // Center
    { x: 75, y: 140, scale: 0.7 },   // Lower left
    { x: 125, y: 140, scale: 0.7 },  // Lower right
  ]

  return (
    <div
      className={`flex flex-col items-center w-full max-w-sm mx-auto ${className}`}
      role="progressbar"
      aria-valuenow={currentAmount}
      aria-valuemin={0}
      aria-valuemax={goalAmount}
      aria-label={`Progreso: ${displayPercentage}%`}
    >
      {/* Amount Display */}
      <div className="text-center mb-6 w-full px-4">
        <div className="backdrop-blur-sm bg-white/40 rounded-2xl p-4 shadow-xl border border-white/30">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 bg-clip-text text-transparent">
            <span className="hidden sm:inline">{formatCurrency(currentAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(currentAmount)}</span>
          </div>
          <div className="text-carmelite-700 mt-1 text-sm sm:text-base font-medium">
            de <span className="hidden sm:inline">{formatCurrency(goalAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(goalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Rose Garden SVG */}
      <div className="relative w-48 sm:w-56 md:w-64">
        <svg viewBox="0 0 200 180" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Rose petal gradient */}
            <radialGradient id="rosePetal" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFC0CB" />
              <stop offset="50%" stopColor="#FF69B4" />
              <stop offset="100%" stopColor="#C71585" />
            </radialGradient>

            {/* Rose center */}
            <radialGradient id="roseCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#DAA520" />
            </radialGradient>

            {/* Leaf gradient */}
            <linearGradient id="roseLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#228B22" />
              <stop offset="100%" stopColor="#006400" />
            </linearGradient>

            {/* Bud gradient */}
            <linearGradient id="roseBud" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#90EE90" />
              <stop offset="100%" stopColor="#228B22" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="roseGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Sparkle filter for complete */}
            <filter id="roseSparkle" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Garden background glow */}
          {animatedPercentage > 80 && (
            <ellipse
              cx="100"
              cy="100"
              rx="85"
              ry="70"
              fill="#FFB6C1"
              opacity="0.2"
              className="animate-pulse"
            />
          )}

          {/* Ground/soil */}
          <ellipse cx="100" cy="165" rx="90" ry="12" fill="#8B4513" opacity="0.6" />
          <ellipse cx="100" cy="162" rx="85" ry="8" fill="#654321" opacity="0.4" />

          {/* Grass/leaves base */}
          <path
            d="M20 160 Q60 140 100 155 Q140 140 180 160 L180 165 L20 165 Z"
            fill="url(#roseLeaf)"
            opacity="0.7"
          />

          {/* Rose stems and leaves */}
          {rosePositions.map((pos, i) => (
            <g key={`stem-${i}`} opacity={i < bloomedRoses ? 1 : 0.3}>
              {/* Stem */}
              <line
                x1={pos.x}
                y1={pos.y + 15 * pos.scale}
                x2={pos.x}
                y2="160"
                stroke="#228B22"
                strokeWidth={2 * pos.scale}
              />
              {/* Leaf */}
              <ellipse
                cx={pos.x + (i % 2 === 0 ? 8 : -8) * pos.scale}
                cy={pos.y + 30 * pos.scale}
                rx={6 * pos.scale}
                ry={3 * pos.scale}
                fill="url(#roseLeaf)"
                transform={`rotate(${i % 2 === 0 ? 30 : -30} ${pos.x + (i % 2 === 0 ? 8 : -8) * pos.scale} ${pos.y + 30 * pos.scale})`}
              />
            </g>
          ))}

          {/* Roses */}
          {rosePositions.map((pos, i) => {
            const isBloomed = i < bloomedRoses

            if (isBloomed) {
              // Full bloomed rose
              return (
                <g
                  key={`rose-${i}`}
                  transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
                  filter="url(#roseGlow)"
                  className="transition-all duration-700"
                >
                  {/* Outer petals */}
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <ellipse
                      key={angle}
                      cx={Math.cos((angle * Math.PI) / 180) * 8}
                      cy={Math.sin((angle * Math.PI) / 180) * 8}
                      rx="10"
                      ry="7"
                      fill="url(#rosePetal)"
                      transform={`rotate(${angle})`}
                    />
                  ))}
                  {/* Inner petals */}
                  {[30, 90, 150, 210, 270, 330].map((angle) => (
                    <ellipse
                      key={angle}
                      cx={Math.cos((angle * Math.PI) / 180) * 4}
                      cy={Math.sin((angle * Math.PI) / 180) * 4}
                      rx="7"
                      ry="5"
                      fill="url(#rosePetal)"
                      transform={`rotate(${angle})`}
                      opacity="0.9"
                    />
                  ))}
                  {/* Center */}
                  <circle cx="0" cy="0" r="4" fill="url(#roseCenter)" />
                </g>
              )
            } else {
              // Unbloomed bud
              return (
                <g
                  key={`bud-${i}`}
                  transform={`translate(${pos.x}, ${pos.y}) scale(${pos.scale})`}
                  opacity="0.5"
                  className="transition-all duration-700"
                >
                  <ellipse cx="0" cy="0" rx="5" ry="8" fill="url(#roseBud)" />
                  <path d="M-3 -8 Q0 -12 3 -8" fill="#228B22" />
                </g>
              )
            }
          })}

          {/* Decorative M for María when complete */}
          {animatedPercentage >= 100 && (
            <g filter="url(#roseSparkle)" className="animate-pulse">
              <text
                x="100"
                y="30"
                textAnchor="middle"
                fontSize="24"
                fontFamily="serif"
                fontStyle="italic"
                fill="#C71585"
                opacity="0.8"
              >
                M
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Rose count indicator */}
      <div className="mt-4 flex justify-center gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i < bloomedRoses
                ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                : 'bg-carmelite-200'
            }`}
            title={`Rosa ${i + 1}`}
          />
        ))}
      </div>

      {/* Percentage Badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-full px-6 py-3 border border-rose-300/30 shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {displayPercentage}%
          </span>
          <span className="text-carmelite-700 font-medium">alcanzado</span>
        </div>
      </div>

      <p className="mt-4 text-center text-carmelite-600 text-sm italic">
        {bloomedRoses} de 12 rosas florecidas para María
      </p>
    </div>
  )
}
