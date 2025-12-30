import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { logAuditEvent, auditHelpers } from '@/lib/audit'

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

    // Parse optional rejection reason from body
    let rejectionReason: string | null = null
    try {
      const body = await request.json()
      if (body.reason && typeof body.reason === 'string') {
        rejectionReason = body.reason.trim().slice(0, 500) // Limit reason length
      }
    } catch {
      // Body is optional, ignore parsing errors
    }

    const supabase = createAdminClient()

    // First, verify the donation exists and is pending
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('id, status')
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

    // Update donation status to rejected
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        status: 'rejected',
        admin_id: session.adminId,
        rejection_reason: rejectionReason,
        approved_at: new Date().toISOString(), // Using approved_at as processed_at
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error rejecting donation:', updateError)
      return NextResponse.json(
        { error: 'Error al rechazar la donación.' },
        { status: 500 }
      )
    }

    // Log audit event
    await logAuditEvent(
      auditHelpers.rejectDonation(
        session.adminId,
        session.adminName,
        id,
        null,
        0, // Amount not fetched in this flow
        rejectionReason || undefined
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Donación rechazada.',
      donation_id: id,
    })

  } catch (error) {
    console.error('Reject donation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
