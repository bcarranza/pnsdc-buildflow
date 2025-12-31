'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Edit2, Save, X, Package, RefreshCw, Plus, Trash2 } from 'lucide-react'

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

const DEFAULT_UNITS = [
  'Bolsas',
  'Quintales',
  'Unidades',
  'Metros',
  'Libras',
  'Costales',
  'Sacos',
  'Varillas',
  'Cubetas',
  'Galones',
]

export default function MaterialsManagement({ open, onClose }: MaterialsManagementProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Edit state
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    unit: '',
    quantity_needed: '',
    quantity_current: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // Create state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    unit: '',
    quantity_needed: '',
    quantity_current: '0',
  })
  const [isCreating, setIsCreating] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
        if (data.units) {
          setUnits(data.units)
        }
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

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Create handlers
  const handleCreate = async () => {
    setError('')

    if (!createForm.name.trim()) {
      setError('Ingrese el nombre del material.')
      return
    }
    if (!createForm.unit) {
      setError('Seleccione la unidad.')
      return
    }
    const qtyNeeded = parseInt(createForm.quantity_needed)
    if (isNaN(qtyNeeded) || qtyNeeded < 1) {
      setError('Ingrese una cantidad total válida.')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name.trim(),
          unit: createForm.unit,
          quantity_needed: qtyNeeded,
          quantity_current: parseInt(createForm.quantity_current) || 0,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMaterials([...materials, data.material].sort((a, b) => a.name.localeCompare(b.name)))
        setShowCreateForm(false)
        setCreateForm({ name: '', unit: '', quantity_needed: '', quantity_current: '0' })
        showSuccess(data.message)
      } else {
        setError(data.error || 'Error al crear material.')
      }
    } catch (err) {
      console.error('Error creating material:', err)
      setError('Error de conexión.')
    } finally {
      setIsCreating(false)
    }
  }

  // Edit handlers
  const startEditing = (material: Material) => {
    setEditingMaterial(material)
    setEditForm({
      name: material.name,
      unit: material.unit,
      quantity_needed: material.quantity_needed.toString(),
      quantity_current: material.quantity_current.toString(),
    })
    setError('')
  }

  const cancelEditing = () => {
    setEditingMaterial(null)
    setEditForm({ name: '', unit: '', quantity_needed: '', quantity_current: '' })
  }

  const saveEdit = async () => {
    if (!editingMaterial) return
    setError('')

    if (!editForm.name.trim()) {
      setError('Ingrese el nombre del material.')
      return
    }
    if (!editForm.unit) {
      setError('Seleccione la unidad.')
      return
    }
    const qtyNeeded = parseInt(editForm.quantity_needed)
    if (isNaN(qtyNeeded) || qtyNeeded < 1) {
      setError('Ingrese una cantidad total válida.')
      return
    }
    const qtyCurrent = parseInt(editForm.quantity_current)
    if (isNaN(qtyCurrent) || qtyCurrent < 0) {
      setError('Ingrese una cantidad actual válida.')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/materials/${editingMaterial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          unit: editForm.unit,
          quantity_needed: qtyNeeded,
          quantity_current: qtyCurrent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMaterials(materials.map(m =>
          m.id === editingMaterial.id
            ? {
                ...m,
                name: editForm.name.trim(),
                unit: editForm.unit,
                quantity_needed: qtyNeeded,
                quantity_current: qtyCurrent,
              }
            : m
        ).sort((a, b) => a.name.localeCompare(b.name)))
        cancelEditing()
        showSuccess(data.message)
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

  // Delete handlers
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setError('')
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/materials/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMaterials(materials.filter(m => m.id !== deleteTarget.id))
        setDeleteTarget(null)
        showSuccess(data.message)
      } else {
        setError(data.error || 'Error al eliminar.')
        setDeleteTarget(null)
      }
    } catch (err) {
      console.error('Error deleting material:', err)
      setError('Error de conexión.')
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getProgress = (current: number, needed: number) => {
    if (needed === 0) return 100
    return Math.min(100, Math.round((current / needed) * 100))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestionar Materiales
            </DialogTitle>
            <DialogDescription>
              Agregue, edite o elimine materiales de construcción.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Action buttons */}
            <div className="flex justify-between gap-2">
              <Button
                onClick={() => {
                  setShowCreateForm(true)
                  setError('')
                }}
                className="bg-carmelite-500 hover:bg-carmelite-600"
                disabled={showCreateForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Material
              </Button>
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

            {/* Create form */}
            {showCreateForm && (
              <Card className="border-carmelite-200 bg-carmelite-50">
                <CardContent className="p-4 space-y-4">
                  <h4 className="font-medium text-carmelite-800">Nuevo Material</h4>

                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nombre</Label>
                    <Input
                      id="new-name"
                      placeholder="Ej: Cemento"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-unit">Unidad</Label>
                    <Select
                      value={createForm.unit}
                      onValueChange={(v) => setCreateForm({ ...createForm, unit: v })}
                      disabled={isCreating}
                    >
                      <SelectTrigger id="new-unit">
                        <SelectValue placeholder="Seleccionar unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-needed">Cantidad Total</Label>
                      <Input
                        id="new-needed"
                        type="number"
                        min="1"
                        placeholder="0"
                        value={createForm.quantity_needed}
                        onChange={(e) => setCreateForm({ ...createForm, quantity_needed: e.target.value })}
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-current">Cantidad Actual</Label>
                      <Input
                        id="new-current"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={createForm.quantity_current}
                        onChange={(e) => setCreateForm({ ...createForm, quantity_current: e.target.value })}
                        disabled={isCreating}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false)
                        setCreateForm({ name: '', unit: '', quantity_needed: '', quantity_current: '0' })
                        setError('')
                      }}
                      disabled={isCreating}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="bg-carmelite-500 hover:bg-carmelite-600"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        'Crear Material'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                <Loader2 className="w-6 h-6 animate-spin text-carmelite-500" />
              </div>
            )}

            {/* Materials list */}
            <div className="space-y-3">
              {materials.map((material) => {
                const progress = getProgress(material.quantity_current, material.quantity_needed)
                const isEditing = editingMaterial?.id === material.id
                const isComplete = progress >= 100

                return (
                  <Card key={material.id} className={isComplete ? 'bg-green-50' : ''}>
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`edit-name-${material.id}`}>Nombre</Label>
                            <Input
                              id={`edit-name-${material.id}`}
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`edit-unit-${material.id}`}>Unidad</Label>
                            <Select
                              value={editForm.unit}
                              onValueChange={(v) => setEditForm({ ...editForm, unit: v })}
                              disabled={isSaving}
                            >
                              <SelectTrigger id={`edit-unit-${material.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`edit-needed-${material.id}`}>Cantidad Total</Label>
                              <Input
                                id={`edit-needed-${material.id}`}
                                type="number"
                                min="1"
                                value={editForm.quantity_needed}
                                onChange={(e) => setEditForm({ ...editForm, quantity_needed: e.target.value })}
                                disabled={isSaving}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`edit-current-${material.id}`}>Cantidad Actual</Label>
                              <Input
                                id={`edit-current-${material.id}`}
                                type="number"
                                min="0"
                                value={editForm.quantity_current}
                                onChange={(e) => setEditForm({ ...editForm, quantity_current: e.target.value })}
                                disabled={isSaving}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveEdit}
                              disabled={isSaving}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-1" />
                                  Guardar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
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

                          {/* Quantity and actions */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600">
                              <span className="font-medium">{material.quantity_current}</span>
                              {' '}de {material.quantity_needed} {material.unit}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(material)}
                              >
                                <Edit2 className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setDeleteTarget(material)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Empty state */}
            {!isLoading && materials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No hay materiales configurados. Agregue uno nuevo.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el material &quot;{deleteTarget?.name}&quot;.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Sí, eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
