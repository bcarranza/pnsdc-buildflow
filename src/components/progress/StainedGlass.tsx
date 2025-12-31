'use client'

import { useEffect, useState } from 'react'
import { ProgressVisualProps, formatCurrency, formatCompactCurrency } from './types'

export function StainedGlass({ currentAmount, goalAmount, className = '' }: ProgressVisualProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100)
  const displayPercentage = Math.round(percentage)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Segments fill based on percentage (8 main segments)
  const filledSegments = Math.floor((animatedPercentage / 100) * 8)
  const partialFill = (animatedPercentage / 100) * 8 - filledSegments

  // Segment colors (traditional stained glass)
  const segmentColors = [
    { filled: '#1E40AF', unfilled: '#1E40AF20' }, // Deep blue
    { filled: '#7C3AED', unfilled: '#7C3AED20' }, // Purple
    { filled: '#DC2626', unfilled: '#DC262620' }, // Red
    { filled: '#059669', unfilled: '#05966920' }, // Green
    { filled: '#D97706', unfilled: '#D9770620' }, // Amber
    { filled: '#0891B2', unfilled: '#0891B220' }, // Cyan
    { filled: '#BE185D', unfilled: '#BE185D20' }, // Pink
    { filled: '#4338CA', unfilled: '#4338CA20' }, // Indigo
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
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
            <span className="hidden sm:inline">{formatCurrency(currentAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(currentAmount)}</span>
          </div>
          <div className="text-carmelite-700 mt-1 text-sm sm:text-base font-medium">
            de <span className="hidden sm:inline">{formatCurrency(goalAmount)}</span>
            <span className="sm:hidden">{formatCompactCurrency(goalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Stained Glass Window SVG */}
      <div className="relative w-40 sm:w-48 md:w-56">
        <svg viewBox="0 0 160 220" className="w-full h-auto drop-shadow-2xl">
          <defs>
            {/* Light glow from behind */}
            <radialGradient id="glassLight" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>

            {/* Glass shine effect */}
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>

            {/* Lead frame gradient */}
            <linearGradient id="leadFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>

            {/* Window arch clip path */}
            <clipPath id="windowClip">
              <path d="M20 210 L20 80 Q80 10 140 80 L140 210 Z" />
            </clipPath>

            {/* Glow filter */}
            <filter id="glassGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background light (stronger when more filled) */}
          <g clipPath="url(#windowClip)">
            <rect
              x="0"
              y="0"
              width="160"
              height="220"
              fill="url(#glassLight)"
              opacity={0.2 + (animatedPercentage / 100) * 0.6}
            />
          </g>

          {/* Window frame (outer) */}
          <path
            d="M15 215 L15 78 Q80 5 145 78 L145 215 Z"
            fill="none"
            stroke="url(#leadFrame)"
            strokeWidth="6"
          />

          {/* Glass segments */}
          <g clipPath="url(#windowClip)">
            {/* Top rose window / circle */}
            <circle
              cx="80"
              cy="55"
              r="25"
              fill={filledSegments > 0 ? segmentColors[0].filled : segmentColors[0].unfilled}
              opacity={filledSegments > 0 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />
            {/* Cross in center of rose */}
            <rect x="77" y="40" width="6" height="30" fill="url(#leadFrame)" />
            <rect x="65" y="52" width="30" height="6" fill="url(#leadFrame)" />

            {/* Top side panels */}
            <path
              d="M25 85 L55 55 L55 85 Z"
              fill={filledSegments > 1 ? segmentColors[1].filled : segmentColors[1].unfilled}
              opacity={filledSegments > 1 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />
            <path
              d="M135 85 L105 55 L105 85 Z"
              fill={filledSegments > 2 ? segmentColors[2].filled : segmentColors[2].unfilled}
              opacity={filledSegments > 2 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* Main left panel */}
            <rect
              x="25"
              y="90"
              width="45"
              height="55"
              fill={filledSegments > 3 ? segmentColors[3].filled : segmentColors[3].unfilled}
              opacity={filledSegments > 3 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* Main right panel */}
            <rect
              x="90"
              y="90"
              width="45"
              height="55"
              fill={filledSegments > 4 ? segmentColors[4].filled : segmentColors[4].unfilled}
              opacity={filledSegments > 4 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* Bottom left panel */}
            <rect
              x="25"
              y="150"
              width="45"
              height="55"
              fill={filledSegments > 5 ? segmentColors[5].filled : segmentColors[5].unfilled}
              opacity={filledSegments > 5 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* Bottom right panel */}
            <rect
              x="90"
              y="150"
              width="45"
              height="55"
              fill={filledSegments > 6 ? segmentColors[6].filled : segmentColors[6].unfilled}
              opacity={filledSegments > 6 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* Center vertical panel with Mary symbol */}
            <rect
              x="72"
              y="85"
              width="16"
              height="120"
              fill={filledSegments > 7 ? segmentColors[7].filled : segmentColors[7].unfilled}
              opacity={filledSegments > 7 ? 0.85 : 0.3}
              className="transition-all duration-700"
            />

            {/* M for María in center */}
            {filledSegments > 7 && (
              <text
                x="80"
                y="150"
                textAnchor="middle"
                fontSize="14"
                fontFamily="serif"
                fontWeight="bold"
                fill="#FFD700"
                filter="url(#glassGlow)"
              >
                M
              </text>
            )}
          </g>

          {/* Lead came (frame lines) */}
          <g stroke="url(#leadFrame)" strokeWidth="3" fill="none">
            {/* Horizontal dividers */}
            <line x1="25" y1="85" x2="135" y2="85" />
            <line x1="25" y1="145" x2="135" y2="145" />
            {/* Vertical divider */}
            <line x1="70" y1="85" x2="70" y2="205" />
            <line x1="90" y1="85" x2="90" y2="205" />
            {/* Diagonal top left */}
            <line x1="25" y1="85" x2="55" y2="55" />
            {/* Diagonal top right */}
            <line x1="135" y1="85" x2="105" y2="55" />
            {/* Rose window frame */}
            <circle cx="80" cy="55" r="26" />
          </g>

          {/* Glass shine overlay */}
          <path
            d="M25 210 L25 82 Q80 15 135 82 L135 210 Z"
            fill="url(#glassShine)"
            opacity="0.3"
          />

          {/* Completion glow effect */}
          {animatedPercentage >= 100 && (
            <g filter="url(#glassGlow)" className="animate-pulse">
              <path
                d="M25 205 L25 82 Q80 15 135 82 L135 205 Z"
                fill="none"
                stroke="#FFD700"
                strokeWidth="3"
                opacity="0.6"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Segment indicators */}
      <div className="mt-4 flex justify-center gap-1.5">
        {segmentColors.map((color, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded transition-all duration-500 border-2"
            style={{
              backgroundColor: i < filledSegments ? color.filled : 'transparent',
              borderColor: color.filled,
              opacity: i < filledSegments ? 1 : 0.3,
              boxShadow: i < filledSegments ? `0 0 8px ${color.filled}` : 'none',
            }}
            title={`Panel ${i + 1}`}
          />
        ))}
      </div>

      {/* Percentage Badge */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full px-6 py-3 border border-blue-300/30 shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {displayPercentage}%
          </span>
          <span className="text-carmelite-700 font-medium">alcanzado</span>
        </div>
      </div>

      <p className="mt-4 text-center text-carmelite-600 text-sm italic">
        {filledSegments} de 8 vitrales iluminados
      </p>
    </div>
  )
}
