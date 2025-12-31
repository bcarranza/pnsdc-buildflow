'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Clock, Package, Eye } from 'lucide-react'

interface PendingDonation {
  id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  material_id: string | null
  proof_image_url: string | null
  created_at: string
  materials: {
    id: string
    name: string
    unit: string
  } | null
}

interface PendingDonationCardProps {
  donation: PendingDonation
  onViewDetails: (donation: PendingDonation) => void
}

export default function PendingDonationCard({ donation, onViewDetails }: PendingDonationCardProps) {
  const displayName = donation.is_anonymous ? 'Anónimo' : (donation.donor_name || 'Sin nombre')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number) => {
    return `Q${amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Donor name and amount */}
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900 truncate">
                {displayName}
              </span>
            </div>

            {/* Amount - prominent display */}
            <div className="text-xl font-bold text-carmelite-600 mb-2">
              {formatAmount(donation.amount)}
            </div>

            {/* Material if specified */}
            {donation.materials && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Package className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{donation.materials.name}</span>
              </div>
            )}

            {/* Date submitted */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(donation.created_at)}</span>
            </div>
          </div>

          {/* View details button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(donation)}
            className="flex-shrink-0 h-12 px-4"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
