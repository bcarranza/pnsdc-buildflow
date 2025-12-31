'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function CrownOfStars({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [twinkle, setTwinkle] = useState<number[]>([])

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Twinkle effect for lit stars
  useEffect(() => {
    const twinkleInterval = setInterval(() => {
      setTwinkle(Array.from({ length: 12 }, () => 0.7 + Math.random() * 0.3))
    }, 200)
    return () => clearInterval(twinkleInterval)
  }, [])

  // 12 stars light up based on percentage
  const litStars = Math.floor((animatedPercentage / 100) * 12)

  // Star positions arranged in a crown arc
  const starPositions = Array.from({ length: 12 }, (_, i) => {
    const angle = (Math.PI * (i + 0.5)) / 12 - Math.PI / 2 + Math.PI / 12
    const radius = 65
    return {
      x: 100 + Math.cos(angle) * radius,
      y: 70 + Math.sin(angle) * radius * 0.5,
      delay: i * 0.1,
    }
  })

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
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
            <span className="hidden sm:inline">{formatCurrency(currentAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(currentAmount)}</span>
          </div>
          <div className="text-carmelite-700 mt-1 text-sm sm:text-base font-medium">
            de <span className="hidden sm:inline">{formatCurrency(goalAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(goalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Crown of Stars SVG */}
      <div className="relative w-48 sm:w-56 md:w-64">
        <svg viewBox="0 0 200 160" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Star gradient (lit) */}
            <radialGradient id="starLit" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>

            {/* Star gradient (unlit) */}
            <radialGradient id="starUnlit" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D1D5DB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </radialGradient>

            {/* Crown gradient */}
            <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#D4AF37" />
            </linearGradient>

            {/* Jewel gradient */}
            <radialGradient id="crownJewel" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#1E90FF" />
            </radialGradient>

            {/* Glow filter for stars */}
            <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Crown shadow */}
            <filter id="crownShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
            </filter>

            {/* Celestial glow */}
            <radialGradient id="celestialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background celestial glow when near complete */}
          {animatedPercentage > 75 && (
            <ellipse
              cx="100"
              cy="80"
              rx={70 + (animatedPercentage - 75)}
              ry={50 + (animatedPercentage - 75) * 0.5}
              fill="url(#celestialGlow)"
              className="animate-pulse"
            />
          )}

          {/* Crown base */}
          <g filter="url(#crownShadow)">
            {/* Crown band */}
            <path
              d="M35 110 Q100 95 165 110 L160 125 Q100 115 40 125 Z"
              fill="url(#crownGold)"
            />

            {/* Crown points */}
            <path
              d="M40 110 L50 85 L65 100 L80 75 L100 90 L120 75 L135 100 L150 85 L160 110"
              fill="url(#crownGold)"
              stroke="#B8860B"
              strokeWidth="1"
            />

            {/* Jewels on crown points */}
            <circle cx="50" cy="90" r="4" fill="url(#crownJewel)" />
            <circle cx="80" cy="80" r="4" fill="url(#crownJewel)" />
            <circle cx="100" cy="93" r="5" fill="url(#crownJewel)" />
            <circle cx="120" cy="80" r="4" fill="url(#crownJewel)" />
            <circle cx="150" cy="90" r="4" fill="url(#crownJewel)" />

            {/* Crown details */}
            <path
              d="M45 115 Q100 105 155 115"
              fill="none"
              stroke="#B8860B"
              strokeWidth="1.5"
            />
            <path
              d="M50 120 Q100 112 150 120"
              fill="none"
              stroke="#B8860B"
              strokeWidth="1"
            />
          </g>

          {/* 12 Stars */}
          {starPositions.map((pos, i) => {
            const isLit = i < litStars
            const starScale = isLit ? (twinkle[i] || 1) : 0.7

            return (
              <g
                key={i}
                transform={`translate(${pos.x}, ${pos.y})`}
                filter={isLit ? 'url(#starGlow)' : undefined}
                className="transition-all duration-500"
              >
                {/* 5-pointed star */}
                <path
                  d={`M0 ${-10 * starScale}
                      L${2.5 * starScale} ${-3 * starScale}
                      L${9.5 * starScale} ${-3 * starScale}
                      L${4 * starScale} ${2 * starScale}
                      L${6 * starScale} ${9 * starScale}
                      L0 ${5 * starScale}
                      L${-6 * starScale} ${9 * starScale}
                      L${-4 * starScale} ${2 * starScale}
                      L${-9.5 * starScale} ${-3 * starScale}
                      L${-2.5 * starScale} ${-3 * starScale} Z`}
                  fill={isLit ? 'url(#starLit)' : 'url(#starUnlit)'}
                  opacity={isLit ? 1 : 0.4}
                />
              </g>
            )
          })}

          {/* "Apocalipsis 12:1" reference when complete */}
          {animatedPercentage >= 100 && (
            <text
              x="100"
              y="150"
              textAnchor="middle"
              fontSize="8"
              fontFamily="serif"
              fontStyle="italic"
              fill="#8B4513"
              opacity="0.6"
            >
              Apocalipsis 12:1
            </text>
          )}
        </svg>
      </div>

      {/* Star count indicator */}
      <div className="mt-4 flex justify-center gap-1.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 transition-all duration-500 ${
              i < litStars
                ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50'
                : 'bg-carmelite-200'
            }`}
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            }}
            title={`Estrella ${i + 1}`}
          />
        ))}
      </div>

      {/* Percentage Badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full px-6 py-3 border border-amber-300/30 shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            {displayPercentage}%
          </span>
          <span className="text-carmelite-700 font-medium">alcanzado</span>
        </div>
      </div>

      <p className="mt-4 text-center text-carmelite-600 text-sm italic">
        {litStars} de 12 estrellas iluminadas
      </p>
    </div>
  )
}
