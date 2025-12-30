'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, User, ArrowUpDown, Filter, X } from 'lucide-react'

interface Donation {
  id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  created_at: string
  material_name?: string | null
}

interface Material {
  id: string
  name: string
}

type SortOption = 'recent' | 'amount' | 'material'

function formatCurrency(amount: number): string {
  return `Q${amount.toLocaleString('es-GT')}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
      className="bg-white rounded-lg border border-amber-100 p-4 shadow-sm hover:shadow-md transition-shadow"
      role="listitem"
      aria-label={`Donación de ${displayName}: ${formatCurrency(amount)}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          {is_anonymous ? (
            <Heart className="w-5 h-5 text-amber-600" aria-hidden="true" />
          ) : (
            <User className="w-5 h-5 text-amber-600" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{displayName}</h3>
          <p className="text-xl font-bold text-amber-600">{formatCurrency(amount)}</p>
          {material_name && (
            <p className="text-sm text-gray-500 truncate">Para: {material_name}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{formatDate(created_at)}</p>
        </div>
      </div>
    </div>
  )
}

interface DonorWallWithFiltersProps {
  donations: Donation[]
  materials: Material[]
  initialLimit?: number
}

export function DonorWallWithFilters({
  donations,
  materials,
  initialLimit = 20,
}: DonorWallWithFiltersProps) {
  const [displayCount, setDisplayCount] = useState(initialLimit)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterMaterial, setFilterMaterial] = useState<string>('')

  // Get unique materials from donations
  const donationMaterials = useMemo(() => {
    const materialsSet = new Set<string>()
    donations.forEach((d) => {
      if (d.material_name) {
        materialsSet.add(d.material_name)
      }
    })
    return Array.from(materialsSet).sort()
  }, [donations])

  // Filter and sort donations
  const processedDonations = useMemo(() => {
    let result = [...donations]

    // Apply material filter
    if (filterMaterial) {
      result = result.filter((d) => d.material_name === filterMaterial)
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'amount':
        result.sort((a, b) => b.amount - a.amount)
        break
      case 'material':
        result.sort((a, b) => {
          const aName = a.material_name || 'zzz' // Put donations without material at end
          const bName = b.material_name || 'zzz'
          return aName.localeCompare(bName)
        })
        break
    }

    return result
  }, [donations, sortBy, filterMaterial])

  const visibleDonations = processedDonations.slice(0, displayCount)
  const hasMore = processedDonations.length > displayCount
  const hasFilters = filterMaterial !== ''

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + initialLimit)
  }

  const clearFilters = () => {
    setFilterMaterial('')
    setSortBy('recent')
  }

  // Empty state
  if (donations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
          <Heart className="w-8 h-8 text-amber-500" aria-hidden="true" />
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
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más recientes</SelectItem>
              <SelectItem value="amount">Mayor monto</SelectItem>
              <SelectItem value="material">Por material</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Material filter dropdown */}
        {donationMaterials.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterMaterial} onValueChange={setFilterMaterial}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filtrar por material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los materiales</SelectItem>
                {donationMaterials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear filters button */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filtered results info */}
      {hasFilters && (
        <p className="text-sm text-gray-500 mb-4">
          Mostrando {processedDonations.length} de {donations.length} donaciones
        </p>
      )}

      {/* No results after filtering */}
      {processedDonations.length === 0 && hasFilters && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No hay donaciones para este material.
          </p>
          <Button
            variant="link"
            onClick={clearFilters}
            className="text-amber-600"
          >
            Ver todas las donaciones
          </Button>
        </div>
      )}

      {/* Donations grid */}
      {processedDonations.length > 0 && (
        <>
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
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Ver más donaciones ({processedDonations.length - displayCount} restantes)
              </Button>
            </div>
          )}

          <p className="mt-4 text-center text-sm text-gray-500">
            {processedDonations.length}{' '}
            {processedDonations.length === 1 ? 'donación' : 'donaciones'}
            {hasFilters ? ' encontradas' : ' en total'}
          </p>
        </>
      )}
    </div>
  )
}
