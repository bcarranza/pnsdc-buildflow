import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for server-side usage (Server Components, Route Handlers).
 * Handles cookie-based sessions automatically.
 *
 * Usage in Server Component:
 * ```ts
 * const supabase = await createServerSupabaseClient()
 * const { data } = await supabase.from('donations').select('*')
 * ```
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - cookies are read-only
          }
        },
      },
    }
  )
}

/**
 * Creates an admin Supabase client with service_role privileges.
 * ONLY use in API routes for privileged operations (approve/reject donations).
 * NEVER expose to client-side code.
 *
 * Usage in API Route:
 * ```ts
 * const adminClient = createAdminClient()
 * await adminClient.from('donations').update({ status: 'approved' })
 * ```
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Admin client doesn't need cookies
        },
      },
    }
  )
}
