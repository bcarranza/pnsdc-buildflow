'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'

interface Material {
  id: string
  name: string
  unit: string
}

interface ManualDonationFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    donor_name: string | null
    is_anonymous: boolean
    amount: number
    material_id: string | null
    notes: string | null
  }) => Promise<void>
}

export default function ManualDonationForm({ open, onClose, onSubmit }: ManualDonationFormProps) {
  const [donorName, setDonorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [amount, setAmount] = useState('')
  const [materialId, setMaterialId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [error, setError] = useState('')

  // Load materials when form opens
  useEffect(() => {
    if (open) {
      fetchMaterials()
    }
  }, [open])

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/admin/materials')
      const data = await response.json()
      if (data.success) {
        setMaterials(data.materials)
      }
    } catch (err) {
      console.error('Error fetching materials:', err)
    }
  }

  const resetForm = () => {
    setDonorName('')
    setIsAnonymous(false)
    setAmount('')
    setMaterialId('')
    setNotes('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      setError('Ingrese un monto válido mayor a Q0.')
      return
    }

    if (!isAnonymous && !donorName.trim()) {
      setError('Ingrese el nombre del donante o marque como anónimo.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        donor_name: isAnonymous ? null : donorName.trim(),
        is_anonymous: isAnonymous,
        amount: parsedAmount,
        material_id: materialId || null,
        notes: notes.trim() || null,
      })
      handleClose()
    } catch (err) {
      console.error('Submit error:', err)
      setError('Error al agregar la donación. Intente de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Donación Manual
          </DialogTitle>
          <DialogDescription>
            Registre una donación recibida en efectivo u otro medio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Donor name */}
          <div className="space-y-2">
            <Label htmlFor="donor-name">Nombre del donante</Label>
            <Input
              id="donor-name"
              placeholder="Ej: Juan Pérez"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              disabled={isAnonymous || isSubmitting}
            />
          </div>

          {/* Anonymous checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => {
                setIsAnonymous(checked as boolean)
                if (checked) setDonorName('')
              }}
              disabled={isSubmitting}
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              Donación anónima
            </Label>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (Q)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              className="text-lg"
            />
          </div>

          {/* Material selection */}
          <div className="space-y-2">
            <Label htmlFor="material">Material (opcional)</Label>
            <Select value={materialId} onValueChange={setMaterialId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Sin preferencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin preferencia</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ej: Donación en efectivo después de misa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Agregar Donación'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
