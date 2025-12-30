'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Clock,
  User,
  History,
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  action_type: string
  admin_id: string | null
  admin_name: string | null
  target_type: string
  target_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  description: string
  created_at: string
}

interface AuditLogViewerProps {
  open: boolean
  onClose: () => void
}

const actionIcons: Record<string, React.ReactNode> = {
  approve_donation: <CheckCircle className="w-4 h-4 text-green-500" />,
  reject_donation: <XCircle className="w-4 h-4 text-red-500" />,
  manual_donation: <Plus className="w-4 h-4 text-amber-500" />,
  update_material: <Edit className="w-4 h-4 text-blue-500" />,
}

const actionLabels: Record<string, string> = {
  approve_donation: 'Aprobación',
  reject_donation: 'Rechazo',
  manual_donation: 'Entrada manual',
  update_material: 'Actualización',
}

export default function AuditLogViewer({ open, onClose }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchLogs = async (newOffset = 0) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/audit?limit=${limit}&offset=${newOffset}`)
      const data = await response.json()

      if (data.success) {
        if (newOffset === 0) {
          setLogs(data.logs)
        } else {
          setLogs((prev) => [...prev, ...data.logs])
        }
        setTotal(data.total)
        setOffset(newOffset)
      } else {
        setError(data.error || 'Error al cargar historial.')
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError('Error de conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchLogs(0)
    }
  }, [open])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasMore = logs.length < total

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Acciones
          </DialogTitle>
          <DialogDescription>
            Registro de todas las acciones administrativas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Refresh button */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {total} {total === 1 ? 'acción' : 'acciones'} en total
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(0)}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && logs.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && logs.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              No hay acciones registradas aún.
            </div>
          )}

          {/* Logs list */}
          <div className="space-y-2">
            {logs.map((log) => (
              <Card key={log.id} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {actionIcons[log.action_type] || (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {actionLabels[log.action_type] || log.action_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.admin_name || 'Sistema'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchLogs(offset + limit)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Cargar más
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
