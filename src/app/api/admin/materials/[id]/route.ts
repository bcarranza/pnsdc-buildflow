import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

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
    const { quantity_current, quantity_needed } = body

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
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

    return NextResponse.json({
      success: true,
      message: `Material "${material.name}" actualizado.`,
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

// GET endpoint to fetch all materials for admin
export async function GET() {
  try {
    // Check authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: materials, error } = await supabase
      .from('materials')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching materials:', error)
      return NextResponse.json(
        { error: 'Error al obtener materiales.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      materials: materials || [],
    })

  } catch (error) {
    console.error('Materials fetch error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
