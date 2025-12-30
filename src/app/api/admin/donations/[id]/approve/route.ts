import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

export async function POST(
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
        { error: 'ID de donación inválido.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, get the donation to verify it exists and is pending
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('id, amount, material_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !donation) {
      return NextResponse.json(
        { error: 'Donación no encontrada.' },
        { status: 404 }
      )
    }

    if (donation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta donación ya fue procesada.' },
        { status: 400 }
      )
    }

    // Update donation status to approved
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        status: 'approved',
        admin_id: session.adminId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error approving donation:', updateError)
      return NextResponse.json(
        { error: 'Error al aprobar la donación.' },
        { status: 500 }
      )
    }

    // Update fundraising goal current_amount
    const { data: currentGoal, error: goalFetchError } = await supabase
      .from('fundraising_goal')
      .select('id, current_amount')
      .limit(1)
      .single()

    if (!goalFetchError && currentGoal) {
      const newAmount = (currentGoal.current_amount || 0) + donation.amount

      await supabase
        .from('fundraising_goal')
        .update({
          current_amount: newAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentGoal.id)
    }

    // If material was claimed, update material quantity
    if (donation.material_id) {
      const { data: material, error: materialFetchError } = await supabase
        .from('materials')
        .select('id, quantity_current')
        .eq('id', donation.material_id)
        .single()

      if (!materialFetchError && material) {
        // Increment material quantity by 1 (each donation claims 1 unit)
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
      message: '¡Donación aprobada exitosamente!',
      donation_id: id,
      amount: donation.amount,
    })

  } catch (error) {
    console.error('Approve donation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
