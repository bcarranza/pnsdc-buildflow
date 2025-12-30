import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface DashboardData {
  fundraising: {
    current_amount: number
    goal_amount: number
  }
  materials: Array<{
    id: string
    name: string
    unit: string
    quantity_needed: number
    quantity_current: number
  }>
  donations: Array<{
    id: string
    donor_name: string | null
    is_anonymous: boolean
    amount: number
    created_at: string
    material_name: string | null
  }>
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Parallel fetching for performance
    const [goalResult, materialsResult, donationsResult] = await Promise.all([
      supabase.from('fundraising_goal').select('current_amount, goal_amount').single(),
      supabase.from('materials').select('id, name, unit, quantity_needed, quantity_current').order('name'),
      supabase
        .from('donations')
        .select(`
          id,
          donor_name,
          is_anonymous,
          amount,
          created_at,
          materials(name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    // Handle errors
    if (goalResult.error) {
      console.error('Error fetching goal:', goalResult.error)
      return NextResponse.json(
        { error: 'No se pudo cargar la meta de recaudación.' },
        { status: 500 }
      )
    }

    if (materialsResult.error) {
      console.error('Error fetching materials:', materialsResult.error)
      return NextResponse.json(
        { error: 'No se pudieron cargar los materiales.' },
        { status: 500 }
      )
    }

    if (donationsResult.error) {
      console.error('Error fetching donations:', donationsResult.error)
      return NextResponse.json(
        { error: 'No se pudieron cargar las donaciones.' },
        { status: 500 }
      )
    }

    // Transform donations to flatten material name
    const donations = (donationsResult.data || []).map((d) => ({
      id: d.id,
      donor_name: d.donor_name,
      is_anonymous: d.is_anonymous,
      amount: d.amount,
      created_at: d.created_at,
      material_name: (d.materials as { name: string } | null)?.name || null,
    }))

    const response: DashboardData = {
      fundraising: {
        current_amount: goalResult.data?.current_amount || 0,
        goal_amount: goalResult.data?.goal_amount || 1000000,
      },
      materials: materialsResult.data || [],
      donations,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Error al conectar con el servidor. Por favor, intenta de nuevo.' },
      { status: 500 }
    )
  }
}
