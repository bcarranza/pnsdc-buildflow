import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

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

    // Get pending donations with material info, sorted by oldest first (FIFO)
    const { data: donations, error } = await supabase
      .from('donations')
      .select(`
        id,
        donor_name,
        is_anonymous,
        amount,
        material_id,
        proof_image_url,
        status,
        created_at,
        materials (
          id,
          name,
          unit
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }) // FIFO - oldest first

    if (error) {
      console.error('Error fetching pending donations:', error)
      return NextResponse.json(
        { error: 'Error al obtener donaciones pendientes.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      donations: donations || [],
      count: donations?.length || 0,
    })

  } catch (error) {
    console.error('Pending donations error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
