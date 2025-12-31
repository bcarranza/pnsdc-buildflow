'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function ChurchBuilding({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Building stages based on percentage
  const showFoundation = animatedPercentage >= 0
  const showWalls = animatedPercentage >= 20
  const showWindows = animatedPercentage >= 40
  const showRoof = animatedPercentage >= 60
  const showBell = animatedPercentage >= 80
  const showCross = animatedPercentage >= 95

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

      {/* Church Building SVG */}
      <div className="relative w-48 sm:w-56 md:w-64">
        <svg viewBox="0 0 200 200" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Building gradient */}
            <linearGradient id="churchWall" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A574" />
              <stop offset="50%" stopColor="#E8C9A0" />
              <stop offset="100%" stopColor="#D4A574" />
            </linearGradient>

            {/* Roof gradient */}
            <linearGradient id="churchRoof" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>

            {/* Window gradient */}
            <linearGradient id="churchWindow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#4A90A4" />
            </linearGradient>

            {/* Golden glow */}
            <radialGradient id="churchGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            {/* Shadow filter */}
            <filter id="churchShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Background glow when complete */}
          {showCross && (
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="url(#churchGlow)"
              className="animate-pulse"
            />
          )}

          {/* Ground */}
          <ellipse cx="100" cy="185" rx="80" ry="8" fill="#654321" opacity="0.4" />

          {/* Foundation - always visible */}
          <g opacity={showFoundation ? 1 : 0.2} className="transition-opacity duration-700">
            <rect x="40" y="170" width="120" height="15" fill="#8B7355" rx="2" />
            <rect x="35" y="175" width="130" height="10" fill="#6B5344" rx="2" />
          </g>

          {/* Walls */}
          <g opacity={showWalls ? 1 : 0.15} className="transition-opacity duration-700" filter="url(#churchShadow)">
            {/* Main building */}
            <rect x="50" y="100" width="100" height="70" fill="url(#churchWall)" rx="2" />
            {/* Tower */}
            <rect x="80" y="50" width="40" height="50" fill="url(#churchWall)" rx="2" />
          </g>

          {/* Windows */}
          <g opacity={showWindows ? 1 : 0.1} className="transition-opacity duration-700">
            {/* Tower window - arched */}
            <path d="M92 60 Q100 55 108 60 L108 85 L92 85 Z" fill="url(#churchWindow)" />
            {/* Main windows */}
            <rect x="60" y="115" width="15" height="25" fill="url(#churchWindow)" rx="2" />
            <rect x="125" y="115" width="15" height="25" fill="url(#churchWindow)" rx="2" />
            {/* Door */}
            <path d="M90 145 Q100 138 110 145 L110 170 L90 170 Z" fill="#5D3A1A" />
            <circle cx="107" cy="158" r="2" fill="#D4AF37" />
          </g>

          {/* Roof */}
          <g opacity={showRoof ? 1 : 0.1} className="transition-opacity duration-700">
            {/* Main roof */}
            <path d="M40 100 L100 65 L160 100 Z" fill="url(#churchRoof)" />
            {/* Tower roof */}
            <path d="M75 50 L100 20 L125 50 Z" fill="url(#churchRoof)" />
          </g>

          {/* Bell */}
          <g opacity={showBell ? 1 : 0.1} className="transition-opacity duration-700">
            <ellipse cx="100" cy="72" rx="8" ry="6" fill="#D4AF37" />
            <rect x="98" y="72" width="4" height="8" fill="#B8860B" />
            <circle cx="100" cy="82" r="3" fill="#8B6914" />
          </g>

          {/* Cross at top */}
          <g opacity={showCross ? 1 : 0.1} className="transition-opacity duration-700">
            <rect x="97" y="5" width="6" height="20" fill="#D4AF37" rx="1" />
            <rect x="91" y="10" width="18" height="5" fill="#D4AF37" rx="1" />
            {/* Cross glow */}
            {showCross && (
              <circle cx="100" cy="15" r="15" fill="#FBBF24" opacity="0.3" className="animate-pulse" />
            )}
          </g>

          {/* Construction elements when incomplete */}
          {!showCross && (
            <g opacity="0.6">
              {/* Scaffolding */}
              <line x1="35" y1="180" x2="35" y2="60" stroke="#8B4513" strokeWidth="2" />
              <line x1="165" y1="180" x2="165" y2="60" stroke="#8B4513" strokeWidth="2" />
              <line x1="35" y1="80" x2="165" y2="80" stroke="#8B4513" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="35" y1="120" x2="165" y2="120" stroke="#8B4513" strokeWidth="1" strokeDasharray="5,5" />
            </g>
          )}
        </svg>
      </div>

      {/* Progress stages indicator */}
      <div className="mt-4 flex justify-center gap-1">
        {[
          { stage: 'Cimientos', done: showFoundation },
          { stage: 'Paredes', done: showWalls },
          { stage: 'Ventanas', done: showWindows },
          { stage: 'Techo', done: showRoof },
          { stage: 'Campana', done: showBell },
          { stage: 'Cruz', done: showCross },
        ].map((item, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              item.done ? 'bg-amber-500 shadow-lg shadow-amber-500/50' : 'bg-carmelite-200'
            }`}
            title={item.stage}
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
        Construyendo juntos nuestra casa de fe
      </p>
    </div>
  )
}
