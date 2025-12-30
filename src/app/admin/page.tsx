'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PendingDonationCard,
  DonationDetailModal,
  ManualDonationForm,
  MaterialsManagement,
  AuditLogViewer,
} from '@/components/admin'
import {
  LogOut,
  Plus,
  Package,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  History,
} from 'lucide-react'
import { toast } from 'sonner'

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

export default function AdminPage() {
  const router = useRouter()
  const [donations, setDonations] = useState<PendingDonation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<PendingDonation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showMaterialsModal, setShowMaterialsModal] = useState(false)
  const [showAuditLog, setShowAuditLog] = useState(false)

  // Fetch pending donations
  const fetchPendingDonations = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError('')

    try {
      const response = await fetch('/api/admin/pending')

      if (response.status === 401) {
        // Not authenticated, redirect to login
        router.push('/admin/login')
        return
      }

      const data = await response.json()

      if (data.success) {
        setDonations(data.donations)
      } else {
        setError(data.error || 'Error al cargar donaciones.')
      }
    } catch (err) {
      console.error('Error fetching pending donations:', err)
      setError('Error de conexión. Intente de nuevo.')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    fetchPendingDonations()
  }, [fetchPendingDonations])

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  // Handle view donation details
  const handleViewDetails = (donation: PendingDonation) => {
    setSelectedDonation(donation)
    setShowDetailModal(true)
  }

  // Handle approve donation
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/donations/${id}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('¡Donación aprobada!', {
          description: `Q${data.amount?.toLocaleString() || ''} agregados al total.`,
        })
        // Remove from local list
        setDonations(donations.filter(d => d.id !== id))
      } else {
        toast.error('Error', { description: data.error })
      }
    } catch (err) {
      console.error('Approve error:', err)
      toast.error('Error de conexión')
    }
  }

  // Handle reject donation
  const handleReject = async (id: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/donations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()

      if (data.success) {
        toast.warning('Donación rechazada')
        // Remove from local list
        setDonations(donations.filter(d => d.id !== id))
      } else {
        toast.error('Error', { description: data.error })
      }
    } catch (err) {
      console.error('Reject error:', err)
      toast.error('Error de conexión')
    }
  }

  // Handle manual donation submission
  const handleManualDonation = async (data: {
    donor_name: string | null
    is_anonymous: boolean
    amount: number
    material_id: string | null
    notes: string | null
  }) => {
    const response = await fetch('/api/admin/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success) {
      toast.success('¡Donación agregada!', {
        description: `Q${data.amount.toLocaleString()} registrados.`,
      })
    } else {
      throw new Error(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-sm text-gray-500">PNSDC BuildFlow</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                title="Ir al inicio"
              >
                <Home className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowManualForm(true)}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Donación
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMaterialsModal(true)}
          >
            <Package className="w-4 h-4 mr-2" />
            Gestionar Materiales
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAuditLog(true)}
          >
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchPendingDonations(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Pending donations section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Donaciones Pendientes
                  {donations.length > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-amber-500 rounded-full">
                      {donations.length}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Revise y apruebe las donaciones enviadas por los fieles.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchPendingDonations()}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && donations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
                <p className="text-xl font-medium text-gray-900 mb-2">
                  ¡No hay donaciones pendientes!
                </p>
                <p className="text-gray-500">
                  Todas las donaciones han sido procesadas.
                </p>
              </div>
            )}

            {/* Donations list */}
            {!isLoading && !error && donations.length > 0 && (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <PendingDonationCard
                    key={donation.id}
                    donation={donation}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Modals */}
      <DonationDetailModal
        donation={selectedDonation}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedDonation(null)
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <ManualDonationForm
        open={showManualForm}
        onClose={() => setShowManualForm(false)}
        onSubmit={handleManualDonation}
      />

      <MaterialsManagement
        open={showMaterialsModal}
        onClose={() => setShowMaterialsModal(false)}
      />

      <AuditLogViewer
        open={showAuditLog}
        onClose={() => setShowAuditLog(false)}
      />
    </div>
  )
}
