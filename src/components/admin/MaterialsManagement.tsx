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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Edit2, Save, X, Package, RefreshCw } from 'lucide-react'

interface Material {
  id: string
  name: string
  unit: string
  quantity_needed: number
  quantity_current: number
}

interface MaterialsManagementProps {
  open: boolean
  onClose: () => void
}

export default function MaterialsManagement({ open, onClose }: MaterialsManagementProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (open) {
      fetchMaterials()
    }
  }, [open])

  const fetchMaterials = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/materials')
      const data = await response.json()
      if (data.success) {
        setMaterials(data.materials)
      } else {
        setError(data.error || 'Error al cargar materiales.')
      }
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError('Error de conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  const startEditing = (material: Material) => {
    setEditingId(material.id)
    setEditValue(material.quantity_current.toString())
    setError('')
    setSuccessMessage('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (materialId: string) => {
    const qty = parseInt(editValue)
    if (isNaN(qty) || qty < 0) {
      setError('Ingrese una cantidad válida.')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity_current: qty }),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setMaterials(materials.map(m =>
          m.id === materialId ? { ...m, quantity_current: qty } : m
        ))
        setSuccessMessage(data.message)
        setEditingId(null)
        setEditValue('')

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Error al guardar.')
      }
    } catch (err) {
      console.error('Error saving material:', err)
      setError('Error de conexión.')
    } finally {
      setIsSaving(false)
    }
  }

  const getProgress = (current: number, needed: number) => {
    if (needed === 0) return 100
    return Math.min(100, Math.round((current / needed) * 100))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gestionar Materiales
          </DialogTitle>
          <DialogDescription>
            Actualice las cantidades de materiales adquiridos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Refresh button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMaterials}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Success message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && materials.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          )}

          {/* Materials list */}
          <div className="space-y-3">
            {materials.map((material) => {
              const progress = getProgress(material.quantity_current, material.quantity_needed)
              const isEditing = editingId === material.id
              const isComplete = progress >= 100

              return (
                <Card key={material.id} className={isComplete ? 'bg-green-50' : ''}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {/* Material name and progress */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {material.name}
                        </span>
                        <span className={`text-sm font-medium ${
                          isComplete ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <Progress value={progress} className="h-2" />

                      {/* Quantity and edit */}
                      <div className="flex items-center justify-between mt-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24 h-9"
                              autoFocus
                            />
                            <span className="text-sm text-gray-500">
                              de {material.quantity_needed} {material.unit}
                            </span>
                            <div className="flex gap-1 ml-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={isSaving}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(material.id)}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isSaving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">{material.quantity_current}</span>
                              {' '}de {material.quantity_needed} {material.unit}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditing(material)}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Empty state */}
          {!isLoading && materials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay materiales configurados.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
