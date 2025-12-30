'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  User,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  ZoomIn,
  ExternalLink,
} from 'lucide-react'

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

interface DonationDetailModalProps {
  donation: PendingDonation | null
  open: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason?: string) => Promise<void>
}

export default function DonationDetailModal({
  donation,
  open,
  onClose,
  onApprove,
  onReject,
}: DonationDetailModalProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [imageZoomed, setImageZoomed] = useState(false)

  if (!donation) return null

  const displayName = donation.is_anonymous ? 'Anónimo' : (donation.donor_name || 'Sin nombre')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number) => {
    return `Q${amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove(donation.id)
      setShowApproveDialog(false)
      onClose()
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject(donation.id, rejectReason || undefined)
      setShowRejectDialog(false)
      setRejectReason('')
      onClose()
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalle de Donación</DialogTitle>
            <DialogDescription>
              Revise la información y el comprobante antes de aprobar o rechazar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Donor info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Donante</p>
                <p className="font-medium text-gray-900">{displayName}</p>
              </div>
            </div>

            {/* Amount - prominent */}
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-sm text-amber-700 mb-1">Monto de la donación</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatAmount(donation.amount)}
              </p>
            </div>

            {/* Material if specified */}
            {donation.materials && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Material especificado</p>
                  <p className="font-medium text-gray-900">{donation.materials.name}</p>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Fecha de envío</p>
                <p className="font-medium text-gray-900">{formatDate(donation.created_at)}</p>
              </div>
            </div>

            {/* Proof image */}
            {donation.proof_image_url && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Comprobante de depósito</Label>
                <div className="relative group">
                  <img
                    src={donation.proof_image_url}
                    alt="Comprobante de depósito"
                    className={`w-full rounded-lg border cursor-pointer transition-transform ${
                      imageZoomed ? 'scale-150 z-50' : ''
                    }`}
                    onClick={() => setImageZoomed(!imageZoomed)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setImageZoomed(!imageZoomed)}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      asChild
                    >
                      <a
                        href={donation.proof_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={isApproving || isRejecting}
              className="w-full sm:w-auto h-12"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={isApproving || isRejecting}
              className="w-full sm:w-auto h-12 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve confirmation dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Aprobar donación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se aprobará la donación de <strong>{formatAmount(donation.amount)}</strong> de{' '}
              <strong>{displayName}</strong>. Los totales se actualizarán inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aprobando...
                </>
              ) : (
                'Sí, aprobar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog with reason field */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar donación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta donación será rechazada y no afectará los totales.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason" className="text-sm font-medium">
              Razón del rechazo (opcional)
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Ej: Comprobante no legible, monto no coincide..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRejecting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rechazando...
                </>
              ) : (
                'Confirmar rechazo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
