'use client'

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-carmelite-800 via-carmelite-700 to-carmelite-900" />

      {/* Soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-400/20 via-transparent to-transparent" />

      {/* Subtle light rays effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-gold-300 to-transparent blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">

          {/* Virgin Mary of Mount Carmel - Cleaner Icon Style */}
          <div className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <defs>
                {/* Halo gradient */}
                <radialGradient id="haloGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF3C7" />
                  <stop offset="60%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
                </radialGradient>

                {/* Gold gradient */}
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                {/* Face skin tone */}
                <radialGradient id="skinTone" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#FDEBD0" />
                  <stop offset="100%" stopColor="#DDB892" />
                </radialGradient>

                {/* Blue mantle gradient */}
                <linearGradient id="mantleBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A5F" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>

                {/* White veil */}
                <linearGradient id="veilWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E5E7EB" />
                </linearGradient>

                {/* Brown robe (Carmelite) */}
                <linearGradient id="robeBrown" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#92400E" />
                  <stop offset="50%" stopColor="#78350F" />
                  <stop offset="100%" stopColor="#5D3A1A" />
                </linearGradient>

                {/* Glow filter */}
                <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Circular halo behind */}
              <circle cx="50" cy="32" r="22" fill="url(#haloGradient)" filter="url(#glowEffect)" />

              {/* Crown with 12 stars */}
              <g filter="url(#glowEffect)">
                {/* Crown base */}
                <path
                  d="M32 24 L36 14 L42 20 L50 10 L58 20 L64 14 L68 24 L64 26 L36 26 Z"
                  fill="url(#goldGradient)"
                />
                {/* Crown jewels */}
                <circle cx="50" cy="16" r="2" fill="#FFFFFF" />
                <circle cx="40" cy="19" r="1.5" fill="#FFFFFF" />
                <circle cx="60" cy="19" r="1.5" fill="#FFFFFF" />
              </g>

              {/* White veil/head covering */}
              <path
                d="M30 28 Q30 26 36 24 L64 24 Q70 26 70 28 Q72 40 68 55 Q65 65 50 68 Q35 65 32 55 Q28 40 30 28 Z"
                fill="url(#veilWhite)"
              />

              {/* Face */}
              <ellipse cx="50" cy="38" rx="12" ry="14" fill="url(#skinTone)" />

              {/* Simple facial features */}
              <ellipse cx="46" cy="36" rx="1.5" ry="1" fill="#5D4037" /> {/* Left eye */}
              <ellipse cx="54" cy="36" rx="1.5" ry="1" fill="#5D4037" /> {/* Right eye */}
              <path d="M48 42 Q50 44 52 42" fill="none" stroke="#8D6E63" strokeWidth="0.8" /> {/* Smile */}

              {/* Blue mantle/cloak */}
              <path
                d="M25 50 Q20 70 25 95 L75 95 Q80 70 75 50 Q70 55 50 55 Q30 55 25 50 Z"
                fill="url(#mantleBlue)"
              />

              {/* Brown inner robe (Carmelite) */}
              <path
                d="M38 55 Q36 75 38 95 L62 95 Q64 75 62 55 Q56 58 50 58 Q44 58 38 55 Z"
                fill="url(#robeBrown)"
              />

              {/* Hands in prayer position */}
              <path
                d="M44 70 Q48 65 50 65 Q52 65 56 70 L54 80 Q50 82 46 80 Z"
                fill="url(#skinTone)"
              />

              {/* Scapular (brown rectangle with Mary symbol) */}
              <rect x="46" y="72" width="8" height="14" rx="1" fill="#D4A574" />
              <text x="50" y="82" textAnchor="middle" fontSize="6" fill="#5D3A1A" fontWeight="bold">M</text>

              {/* 12 small stars around halo */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                const r = 28
                const x = 50 + Math.cos((angle - 90) * Math.PI / 180) * r
                const y = 32 + Math.sin((angle - 90) * Math.PI / 180) * r * 0.7
                if (y > 50) return null // Don't show stars behind body
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="2"
                    fill="#FBBF24"
                    filter="url(#glowEffect)"
                  />
                )
              })}
            </svg>
          </div>

          {/* Text content */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
              Parroquia Nuestra Señora del Carmen
            </h1>
            <p className="text-carmelite-200 mt-1 text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Jalapa, Guatemala
            </p>

            {/* Project banner - CLEAR WHITE TEXT */}
            <div className="mt-4 inline-block">
              <div className="backdrop-blur-md bg-gold-500/20 border border-gold-400/40 rounded-2xl px-6 py-3 shadow-xl">
                <p className="text-lg md:text-xl font-bold text-white drop-shadow-md">
                  Construcción del Nuevo Salón Parroquial
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="w-full h-6 md:h-8">
          <path
            d="M0 40 Q300 0 600 20 T1200 10 L1200 40 Z"
            fill="url(#waveGradient)"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(250, 250, 249)" />
              <stop offset="50%" stopColor="rgb(254, 252, 251)" />
              <stop offset="100%" stopColor="rgb(250, 250, 249)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </header>
  )
}
