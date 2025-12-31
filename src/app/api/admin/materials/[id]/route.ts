import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { logAuditEvent, auditHelpers } from '@/lib/audit'

// Predefined unit options
const VALID_UNITS = [
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de material inválido.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, unit, quantity_current, quantity_needed } = body

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return NextResponse.json(
          { error: 'Nombre inválido (2-100 caracteres).' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    // Validate and add unit if provided
    if (unit !== undefined) {
      if (!VALID_UNITS.includes(unit)) {
        return NextResponse.json(
          { error: 'Unidad inválida.' },
          { status: 400 }
        )
      }
      updateData.unit = unit
    }

    // Validate and add quantity_current if provided
    if (quantity_current !== undefined) {
      const qty = Number(quantity_current)
      if (isNaN(qty) || qty < 0 || qty > 100000) {
        return NextResponse.json(
          { error: 'Cantidad actual inválida.' },
          { status: 400 }
        )
      }
      updateData.quantity_current = qty
    }

    // Validate and add quantity_needed if provided
    if (quantity_needed !== undefined) {
      const qty = Number(quantity_needed)
      if (isNaN(qty) || qty < 1 || qty > 100000) {
        return NextResponse.json(
          { error: 'Cantidad necesaria inválida.' },
          { status: 400 }
        )
      }
      updateData.quantity_needed = qty
    }

    // Must have at least one field to update
    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        { error: 'No hay datos para actualizar.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify material exists and get current values
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('id, name, quantity_current')
      .eq('id', id)
      .single()

    if (fetchError || !material) {
      return NextResponse.json(
        { error: 'Material no encontrado.' },
        { status: 404 }
      )
    }

    const oldQuantity = material.quantity_current

    // Update material
    const { error: updateError } = await supabase
      .from('materials')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating material:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar el material.' },
        { status: 500 }
      )
    }

    // Log audit event if quantity changed
    if (updateData.quantity_current !== undefined) {
      await logAuditEvent(
        auditHelpers.updateMaterial(
          session.adminId,
          session.adminName,
          id,
          material.name,
          oldQuantity,
          updateData.quantity_current as number
        )
      )
    }

    return NextResponse.json({
      success: true,
      message: `Material "${updateData.name || material.name}" actualizado.`,
      material_id: id,
    })

  } catch (error) {
    console.error('Material update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove a material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID de material inválido.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify material exists
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !material) {
      return NextResponse.json(
        { error: 'Material no encontrado.' },
        { status: 404 }
      )
    }

    // Check if there are donations linked to this material
    const { count: donationCount } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('material_id', id)

    if (donationCount && donationCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar. Hay ${donationCount} donación(es) asociada(s) a este material.`,
          hasDonations: true,
          donationCount
        },
        { status: 409 }
      )
    }

    // Delete material
    const { error: deleteError } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting material:', deleteError)
      return NextResponse.json(
        { error: 'Error al eliminar el material.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Material "${material.name}" eliminado.`,
    })

  } catch (error) {
    console.error('Material delete error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
