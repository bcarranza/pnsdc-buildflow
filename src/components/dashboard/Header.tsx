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

          {/* Virgin Mary of Mount Carmel SVG Illustration */}
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <defs>
                {/* Crown gold gradient */}
                <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F6E05E" />
                  <stop offset="50%" stopColor="#D69E2E" />
                  <stop offset="100%" stopColor="#B7791F" />
                </linearGradient>

                {/* Veil gradient */}
                <linearGradient id="veilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E8D5B7" />
                  <stop offset="100%" stopColor="#C9B896" />
                </linearGradient>

                {/* Mantle brown gradient */}
                <linearGradient id="mantleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B6914" />
                  <stop offset="50%" stopColor="#6B4423" />
                  <stop offset="100%" stopColor="#5D3A1A" />
                </linearGradient>

                {/* Halo glow */}
                <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                </radialGradient>

                {/* Star gradient */}
                <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </radialGradient>

                {/* Face gradient */}
                <radialGradient id="faceGradient" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#FDEBD0" />
                  <stop offset="100%" stopColor="#E8CEBB" />
                </radialGradient>

                {/* Glow filter */}
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Halo/Aureole */}
              <circle cx="50" cy="35" r="28" fill="url(#haloGlow)" />

              {/* 12 Stars around crown (Apocalypse 12:1) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                const radius = 24
                const x = 50 + Math.cos((angle - 90) * Math.PI / 180) * radius
                const y = 28 + Math.sin((angle - 90) * Math.PI / 180) * radius * 0.6
                return (
                  <g key={i} transform={`translate(${x}, ${y})`} filter="url(#softGlow)">
                    <path
                      d="M0 -3 L0.7 -0.9 L3 -0.9 L1.2 0.4 L1.9 2.5 L0 1.2 L-1.9 2.5 L-1.2 0.4 L-3 -0.9 L-0.7 -0.9 Z"
                      fill="url(#starGlow)"
                      opacity={i < 6 ? 1 : 0.8}
                    />
                  </g>
                )
              })}

              {/* Crown */}
              <path
                d="M35 25 L40 18 L45 23 L50 15 L55 23 L60 18 L65 25 L62 28 L38 28 Z"
                fill="url(#crownGold)"
                filter="url(#softGlow)"
              />

              {/* Face */}
              <ellipse cx="50" cy="35" rx="10" ry="12" fill="url(#faceGradient)" />

              {/* Veil */}
              <path
                d="M35 30 Q35 45 40 60 Q45 70 50 72 Q55 70 60 60 Q65 45 65 30 Q60 28 50 28 Q40 28 35 30 Z"
                fill="url(#veilGradient)"
              />

              {/* Mantle/Robe (Carmelite brown) */}
              <path
                d="M30 50 Q25 75 30 95 L70 95 Q75 75 70 50 Q65 55 50 55 Q35 55 30 50 Z"
                fill="url(#mantleGradient)"
              />

              {/* Scapular detail */}
              <rect x="45" y="55" width="10" height="25" rx="2" fill="#E8D5B7" opacity="0.8" />

              {/* Baby Jesus suggestion (simplified) */}
              <ellipse cx="42" cy="68" rx="6" ry="5" fill="url(#faceGradient)" opacity="0.9" />
              <ellipse cx="42" cy="75" rx="5" ry="8" fill="#E8D5B7" opacity="0.8" />

              {/* Mount Carmel silhouette at bottom */}
              <path
                d="M10 95 L25 80 L40 88 L50 78 L60 88 L75 80 L90 95 Z"
                fill="#3D2314"
                opacity="0.3"
              />
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

            {/* Project banner with glassmorphism */}
            <div className="mt-4 inline-block">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl px-6 py-3 shadow-xl">
                <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300 bg-clip-text text-transparent">
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
