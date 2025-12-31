'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function VotiveCandle({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [flameIntensity, setFlameIntensity] = useState(1)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Flame flicker effect
  useEffect(() => {
    const flickerInterval = setInterval(() => {
      setFlameIntensity(0.85 + Math.random() * 0.3)
    }, 150)
    return () => clearInterval(flickerInterval)
  }, [])

  const fillHeight = (animatedPercentage / 100) * 120

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
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
            <span className="hidden sm:inline">{formatCurrency(currentAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(currentAmount)}</span>
          </div>
          <div className="text-carmelite-700 mt-1 text-sm sm:text-base font-medium">
            de <span className="hidden sm:inline">{formatCurrency(goalAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(goalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Votive Candle SVG */}
      <div className="relative w-32 sm:w-40 md:w-48">
        <svg viewBox="0 0 120 220" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Flame gradients */}
            <radialGradient id="candleFlameOuter" cx="50%" cy="70%" r="50%" fx="50%" fy="90%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FEF08A" />
              <stop offset="60%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>

            <radialGradient id="candleFlameInner" cx="50%" cy="60%" r="40%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>

            {/* Glass candle body */}
            <linearGradient id="candleGlass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 69, 19, 0.25)" />
              <stop offset="20%" stopColor="rgba(180, 100, 50, 0.15)" />
              <stop offset="50%" stopColor="rgba(220, 150, 80, 0.1)" />
              <stop offset="80%" stopColor="rgba(180, 100, 50, 0.15)" />
              <stop offset="100%" stopColor="rgba(139, 69, 19, 0.25)" />
            </linearGradient>

            {/* Glow fill */}
            <linearGradient id="candleGlowFill" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>

            {/* Filters */}
            <filter id="candleFlameGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="candleFillGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <clipPath id="candleBodyClip">
              <rect x="25" y="70" width="70" height="120" rx="8" />
            </clipPath>
          </defs>

          {/* Ambient glow */}
          <ellipse
            cx="60"
            cy="130"
            rx={35 + animatedPercentage * 0.2}
            ry={50 + animatedPercentage * 0.3}
            fill="url(#candleGlowFill)"
            opacity={0.12 + (animatedPercentage / 100) * 0.12}
            className="transition-all duration-1000"
          />

          {/* Candle holder */}
          <ellipse cx="60" cy="195" rx="32" ry="5" fill="#8B4513" opacity="0.8" />
          <rect x="32" y="188" width="56" height="10" rx="2" fill="#A0522D" />
          <rect x="36" y="183" width="48" height="8" rx="2" fill="#8B4513" />

          {/* Glass container */}
          <rect
            x="25"
            y="70"
            width="70"
            height="120"
            rx="8"
            fill="url(#candleGlass)"
            stroke="rgba(139, 69, 19, 0.3)"
            strokeWidth="2"
          />

          {/* Glass shine */}
          <path d="M30 75 Q34 70 38 75 L38 185 Q34 190 30 185 Z" fill="rgba(255,255,255,0.15)" />

          {/* Progress fill */}
          <g clipPath="url(#candleBodyClip)">
            <rect
              x="25"
              y={190 - fillHeight}
              width="70"
              height={fillHeight}
              fill="url(#candleGlowFill)"
              opacity={0.65 + (animatedPercentage / 100) * 0.3}
              filter="url(#candleFillGlow)"
              className="transition-all duration-1000 ease-out"
            />
            <ellipse
              cx="60"
              cy={190 - fillHeight}
              rx="30"
              ry="4"
              fill="#FEF3C7"
              opacity="0.7"
              className="transition-all duration-1000"
            />
          </g>

          {/* Wick */}
          <rect x="58" y="55" width="4" height="18" rx="2" fill="#3D2314" />

          {/* Flame */}
          <g
            filter="url(#candleFlameGlow)"
            style={{ transform: `scale(${flameIntensity})`, transformOrigin: '60px 55px' }}
          >
            <path
              d="M60 12 Q70 26 68 40 Q66 50 60 55 Q54 50 52 40 Q50 26 60 12"
              fill="url(#candleFlameOuter)"
              opacity="0.9"
            />
            <path
              d="M60 22 Q66 32 64 43 Q62 50 60 55 Q58 50 56 43 Q54 32 60 22"
              fill="url(#candleFlameInner)"
            />
            <ellipse cx="60" cy="48" rx="3" ry="5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Decorative cross */}
          <g opacity="0.25" fill="#5D3A1A">
            <rect x="57" y="110" width="6" height="28" rx="1" />
            <rect x="50" y="118" width="20" height="5" rx="1" />
          </g>
        </svg>
      </div>

      {/* Percentage Badge */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full px-6 py-3 border border-amber-300/30 shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            {displayPercentage}%
          </span>
          <span className="text-carmelite-700 font-medium">alcanzado</span>
        </div>
      </div>

      <p className="mt-4 text-center text-carmelite-600 text-sm italic">
        Cada donación enciende una luz de esperanza
      </p>
    </div>
  )
}
