import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { createAdminClient } from './supabase/server'

const SALT_ROUNDS = 10
const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export interface AdminSession {
  adminId: string
  adminName: string
  expiresAt: number
}

/**
 * Hash a PIN using bcryptjs
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify a PIN against a hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

/**
 * Create a session cookie for an authenticated admin
 */
export async function createSession(adminId: string, adminName: string): Promise<void> {
  const cookieStore = await cookies()

  const session: AdminSession = {
    adminId,
    adminName,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  }

  // Simple base64 encoding for session data (in production, use proper JWT or encrypted tokens)
  const sessionValue = Buffer.from(JSON.stringify(session)).toString('base64')

  cookieStore.set(SESSION_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Get the current admin session from cookies
 * Returns null if not authenticated or session expired
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session: AdminSession = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    )

    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Clear the admin session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Verify that the current request has a valid admin session
 * Returns the session if valid, null otherwise
 */
export async function requireAuth(): Promise<AdminSession | null> {
  return getSession()
}

/**
 * Update the admin's last login timestamp
 */
export async function updateLastLogin(adminId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminId)
}
