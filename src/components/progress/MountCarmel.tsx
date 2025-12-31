'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function MountCarmel({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

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

      {/* Mount Carmel SVG */}
      <div className="relative w-48 sm:w-56 md:w-64">
        <svg viewBox="0 0 200 180" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Mountain gradient */}
            <linearGradient id="mountainGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#CD853F" />
            </linearGradient>

            {/* Golden light fill */}
            <linearGradient id="goldenLight" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </linearGradient>

            {/* Glow effect */}
            <filter id="mountainGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clip path for mountain shape */}
            <clipPath id="mountainClip">
              <path d="M100 20 L180 150 L20 150 Z" />
            </clipPath>

            {/* Sun gradient */}
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background sun/glow */}
          <circle
            cx="100"
            cy="40"
            r={30 + animatedPercentage * 0.3}
            fill="url(#sunGlow)"
            opacity={0.3 + (animatedPercentage / 100) * 0.4}
            className="transition-all duration-1000"
          />

          {/* Mountain outline */}
          <path
            d="M100 20 L180 150 L20 150 Z"
            fill="url(#mountainGradient)"
            stroke="#5D3A1A"
            strokeWidth="2"
          />

          {/* Snow cap */}
          <path
            d="M100 20 L120 50 L80 50 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Golden light fill inside mountain */}
          <g clipPath="url(#mountainClip)">
            <rect
              x="0"
              y={150 - fillHeight}
              width="200"
              height={fillHeight}
              fill="url(#goldenLight)"
              filter="url(#mountainGlow)"
              opacity={0.8}
              className="transition-all duration-1000 ease-out"
            />
          </g>

          {/* Cross at peak */}
          <g fill="#5D3A1A" opacity={animatedPercentage > 90 ? 1 : 0.3} className="transition-opacity duration-500">
            <rect x="97" y="5" width="6" height="20" rx="1" />
            <rect x="91" y="10" width="18" height="5" rx="1" />
          </g>

          {/* Mountain ridges/texture */}
          <path d="M60 100 L100 50 L140 100" fill="none" stroke="#5D3A1A" strokeWidth="1" opacity="0.3" />
          <path d="M40 130 L100 70 L160 130" fill="none" stroke="#5D3A1A" strokeWidth="1" opacity="0.2" />

          {/* Base/ground */}
          <ellipse cx="100" cy="155" rx="90" ry="8" fill="#654321" opacity="0.5" />
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
        Subiendo juntos hacia la meta
      </p>
    </div>
  )
}
