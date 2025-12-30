import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

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
