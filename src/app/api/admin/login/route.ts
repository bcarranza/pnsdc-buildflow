import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPin, createSession, updateLastLogin } from '@/lib/auth'

// Track failed attempts per IP for rate limiting
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 3
const COOLDOWN_MS = 30000 // 30 seconds

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

function checkRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const record = failedAttempts.get(ip)

  if (!record) {
    return { allowed: true }
  }

  const timeSinceLastAttempt = Date.now() - record.lastAttempt

  // Reset if cooldown has passed
  if (timeSinceLastAttempt > COOLDOWN_MS) {
    failedAttempts.delete(ip)
    return { allowed: true }
  }

  // Block if too many attempts within cooldown
  if (record.count >= MAX_ATTEMPTS) {
    const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000)
    return { allowed: false, remainingSeconds }
  }

  return { allowed: true }
}

function recordFailedAttempt(ip: string): void {
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 }
  record.count++
  record.lastAttempt = Date.now()
  failedAttempts.set(ip, record)
}

function clearFailedAttempts(ip: string): void {
  failedAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request)

    // Check rate limiting
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Espere ${rateLimit.remainingSeconds} segundos.`,
          cooldown: rateLimit.remainingSeconds
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { pin } = body

    // Validate PIN format (4-6 digits)
    if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'PIN inválido. Debe ser de 4 a 6 dígitos.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get all active admins and try to match PIN
    const { data: admins, error: queryError } = await supabase
      .from('admins')
      .select('id, name, pin_hash')

    if (queryError) {
      console.error('Error fetching admins:', queryError)
      return NextResponse.json(
        { error: 'Error del servidor. Intente de nuevo.' },
        { status: 500 }
      )
    }

    if (!admins || admins.length === 0) {
      return NextResponse.json(
        { error: 'No hay administradores configurados.' },
        { status: 500 }
      )
    }

    // Try to find matching admin
    let matchedAdmin: { id: string; name: string } | null = null

    for (const admin of admins) {
      const isMatch = await verifyPin(pin, admin.pin_hash)
      if (isMatch) {
        matchedAdmin = { id: admin.id, name: admin.name }
        break
      }
    }

    if (!matchedAdmin) {
      recordFailedAttempt(ip)
      const record = failedAttempts.get(ip)
      const attemptsRemaining = MAX_ATTEMPTS - (record?.count || 0)

      return NextResponse.json(
        {
          error: 'PIN incorrecto.',
          attemptsRemaining: Math.max(0, attemptsRemaining)
        },
        { status: 401 }
      )
    }

    // Successful login
    clearFailedAttempts(ip)

    // Create session cookie
    await createSession(matchedAdmin.id, matchedAdmin.name)

    // Update last login timestamp
    await updateLastLogin(matchedAdmin.id)

    return NextResponse.json({
      success: true,
      message: `¡Bienvenido/a, ${matchedAdmin.name}!`,
      admin: {
        id: matchedAdmin.id,
        name: matchedAdmin.name,
      },
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error del servidor. Intente de nuevo.' },
      { status: 500 }
    )
  }
}
