import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET endpoint to fetch site settings (public)
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error) {
      console.error('Error fetching site settings:', error)
      return NextResponse.json(
        { error: 'Error al obtener configuración.' },
        { status: 500 }
      )
    }

    // Convert array to object for easier access
    const settingsMap: Record<string, string> = {}
    for (const setting of settings || []) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    })

  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}
