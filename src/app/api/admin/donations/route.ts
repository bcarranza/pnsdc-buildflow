import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// Sanitize string input
function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"&]/g, '')
    .trim()
    .slice(0, 255)
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { donor_name, is_anonymous, amount, material_id, notes } = body

    // Validate amount
    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 1000000) {
      return NextResponse.json(
        { error: 'El monto debe ser entre Q1 y Q1,000,000.' },
        { status: 400 }
      )
    }

    // Validate donor name if not anonymous
    const isAnon = Boolean(is_anonymous)
    const sanitizedName = sanitizeString(donor_name)
    if (!isAnon && (!sanitizedName || sanitizedName.length === 0)) {
      return NextResponse.json(
        { error: 'El nombre del donante es requerido si no es anónimo.' },
        { status: 400 }
      )
    }

    // Validate material_id if provided
    let validMaterialId: string | null = null
    if (material_id && typeof material_id === 'string' && material_id.trim()) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(material_id)) {
        return NextResponse.json(
          { error: 'ID de material inválido.' },
          { status: 400 }
        )
      }
      validMaterialId = material_id
    }

    const supabase = createAdminClient()

    // If material_id provided, verify it exists
    if (validMaterialId) {
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .select('id')
        .eq('id', validMaterialId)
        .single()

      if (materialError || !material) {
        return NextResponse.json(
          { error: 'El material seleccionado no existe.' },
          { status: 400 }
        )
      }
    }

    // Create the donation as already approved (manual entry)
    const { data: donation, error: insertError } = await supabase
      .from('donations')
      .insert({
        donor_name: isAnon ? null : sanitizedName,
        is_anonymous: isAnon,
        amount: parsedAmount,
        material_id: validMaterialId,
        proof_image_url: notes ? `Manual: ${sanitizeString(notes)?.slice(0, 200)}` : 'Entrada manual',
        status: 'approved',
        admin_id: session.adminId,
        approved_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating manual donation:', insertError)
      return NextResponse.json(
        { error: 'Error al crear la donación.' },
        { status: 500 }
      )
    }

    // Update fundraising goal current_amount
    const { data: currentGoal } = await supabase
      .from('fundraising_goal')
      .select('id, current_amount')
      .limit(1)
      .single()

    if (currentGoal) {
      const newAmount = (currentGoal.current_amount || 0) + parsedAmount

      await supabase
        .from('fundraising_goal')
        .update({
          current_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentGoal.id)
    }

    // If material was claimed, update material quantity
    if (validMaterialId) {
      const { data: material } = await supabase
        .from('materials')
        .select('id, quantity_current')
        .eq('id', validMaterialId)
        .single()

      if (material) {
        await supabase
          .from('materials')
          .update({
            quantity_current: material.quantity_current + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', material.id)
      }
    }

    return NextResponse.json({
      success: true,
      message: '¡Donación agregada exitosamente!',
      donation_id: donation.id,
    }, { status: 201 })

  } catch (error) {
    console.error('Manual donation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
