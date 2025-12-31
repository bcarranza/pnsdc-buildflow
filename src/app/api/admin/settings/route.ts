import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'

// Valid progress visual types
const VALID_PROGRESS_VISUALS = [
  'mountain',
  'candle',
  'church',
  'roses',
  'crown',
  'stained_glass',
]

// GET endpoint to fetch all settings (admin)
export async function GET() {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key')

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(
        { error: 'Error al obtener configuración.' },
        { status: 500 }
      )
    }

    // Convert to map
    const settingsMap: Record<string, string> = {}
    for (const setting of settings || []) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      options: {
        progress_visual: VALID_PROGRESS_VISUALS,
      },
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update a setting
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado. Inicie sesión.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { key, value } = body

    // Validate key
    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Clave de configuración requerida.' },
        { status: 400 }
      )
    }

    // Validate value based on key
    if (key === 'progress_visual') {
      if (!VALID_PROGRESS_VISUALS.includes(value)) {
        return NextResponse.json(
          { error: 'Tipo de visualización inválido.' },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    // Upsert the setting
    const { data: setting, error } = await supabase
      .from('site_settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      return NextResponse.json(
        { error: 'Error al actualizar configuración.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada.',
      setting,
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
