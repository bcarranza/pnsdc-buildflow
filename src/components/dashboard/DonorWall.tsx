'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, User } from 'lucide-react'

export interface Donation {
  id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  created_at: string
  material_name?: string | null
}

function formatCurrency(amount: number): string {
  return `Q${amount.toLocaleString('es-GT')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

interface DonorCardProps {
  donation: Donation
}

function DonorCard({ donation }: DonorCardProps) {
  const { donor_name, is_anonymous, amount, created_at, material_name } = donation
  const displayName = is_anonymous ? 'Anónimo' : donor_name || 'Anónimo'

  return (
    <div
      className="bg-white rounded-lg border border-carmelite-100 p-4 shadow-sm hover:shadow-md transition-shadow"
      role="listitem"
      aria-label={`Donación de ${displayName}: ${formatCurrency(amount)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-carmelite-100 flex items-center justify-center">
          {is_anonymous ? (
            <Heart className="w-5 h-5 text-carmelite-600" aria-hidden="true" />
          ) : (
            <User className="w-5 h-5 text-carmelite-600" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">
            {displayName}
          </h3>
          <p className="text-xl font-bold text-carmelite-600">
            {formatCurrency(amount)}
          </p>
          {material_name && (
            <p className="text-sm text-gray-500 truncate">
              Para: {material_name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

interface DonorWallProps {
  donations: Donation[]
  initialLimit?: number
}

export function DonorWall({ donations, initialLimit = 20 }: DonorWallProps) {
  const [displayCount, setDisplayCount] = useState(initialLimit)

  // Sort by date (most recent first)
  const sortedDonations = [...donations].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const visibleDonations = sortedDonations.slice(0, displayCount)
  const hasMore = sortedDonations.length > displayCount

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + initialLimit)
  }

  // Empty state
  if (donations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-carmelite-100 flex items-center justify-center">
          <Heart className="w-8 h-8 text-carmelite-500" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Aún no hay donaciones
        </h3>
        <p className="text-gray-500 max-w-xs mx-auto">
          ¡Sé el primero en contribuir a esta noble causa para nuestra comunidad!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Lista de donantes"
      >
        {visibleDonations.map((donation) => (
          <DonorCard key={donation.id} donation={donation} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="border-carmelite-300 text-carmelite-700 hover:bg-carmelite-50"
          >
            Ver más donaciones ({sortedDonations.length - displayCount} restantes)
          </Button>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-gray-500">
        {sortedDonations.length} {sortedDonations.length === 1 ? 'donación' : 'donaciones'} en total
      </p>
    </div>
  )
}
