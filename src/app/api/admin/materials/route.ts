import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

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
      units: VALID_UNITS,
    })

  } catch (error) {
    console.error('Materials fetch error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// POST endpoint to create a new material
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
    const { name, unit, quantity_needed, quantity_current } = body

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Nombre inválido (2-100 caracteres).' },
        { status: 400 }
      )
    }

    // Validate unit
    if (!unit || !VALID_UNITS.includes(unit)) {
      return NextResponse.json(
        { error: 'Unidad inválida.' },
        { status: 400 }
      )
    }

    // Validate quantity_needed
    const qtyNeeded = Number(quantity_needed)
    if (isNaN(qtyNeeded) || qtyNeeded < 1 || qtyNeeded > 100000) {
      return NextResponse.json(
        { error: 'Cantidad necesaria inválida (1-100,000).' },
        { status: 400 }
      )
    }

    // Validate quantity_current (optional, defaults to 0)
    const qtyCurrent = quantity_current !== undefined ? Number(quantity_current) : 0
    if (isNaN(qtyCurrent) || qtyCurrent < 0 || qtyCurrent > 100000) {
      return NextResponse.json(
        { error: 'Cantidad actual inválida (0-100,000).' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if material with same name already exists
    const { data: existing } = await supabase
      .from('materials')
      .select('id')
      .ilike('name', name.trim())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un material con ese nombre.' },
        { status: 409 }
      )
    }

    // Create material
    const { data: material, error: createError } = await supabase
      .from('materials')
      .insert({
        name: name.trim(),
        unit,
        quantity_needed: qtyNeeded,
        quantity_current: qtyCurrent,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating material:', createError)
      return NextResponse.json(
        { error: 'Error al crear el material.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Material "${name.trim()}" creado exitosamente.`,
      material,
    })

  } catch (error) {
    console.error('Material create error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
