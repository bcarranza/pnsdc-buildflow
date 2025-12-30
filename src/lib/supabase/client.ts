import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses the anon key which is safe to expose in the browser.
 *
 * Usage:
 * ```ts
 * const supabase = createClient()
 * const { data } = await supabase.from('materials').select('*')
 * ```
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
