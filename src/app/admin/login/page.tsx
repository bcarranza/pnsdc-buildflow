'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cooldown > 0) return

    // Validate PIN format
    if (!/^\d{4,6}$/.test(pin)) {
      setError('El PIN debe ser de 4 a 6 dígitos.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Successful login, redirect to admin panel
        router.push('/admin')
        router.refresh()
      } else if (response.status === 429) {
        // Rate limited
        setCooldown(data.cooldown || 30)
        setError(data.error)
        setPin('')
      } else {
        // Failed login
        setError(data.error || 'PIN incorrecto.')
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining)
        }
        setPin('')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Error de conexión. Intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-carmelite-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-carmelite-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-carmelite-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ingrese su PIN para continuar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-sm font-medium">
                PIN de Administrador
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '')
                  setPin(value)
                  setError('')
                }}
                disabled={isLoading || cooldown > 0}
                className="text-center text-2xl tracking-widest h-14"
                autoComplete="current-password"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {attemptsRemaining !== null && attemptsRemaining > 0 && attemptsRemaining < 3 && (
              <p className="text-sm text-carmelite-600 text-center">
                {attemptsRemaining} intento{attemptsRemaining !== 1 ? 's' : ''} restante{attemptsRemaining !== 1 ? 's' : ''}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-carmelite-500 hover:bg-carmelite-600 text-white font-medium"
              disabled={isLoading || cooldown > 0 || pin.length < 4}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : cooldown > 0 ? (
                `Espere ${cooldown}s`
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-carmelite-600 transition-colors"
            >
              Volver al inicio
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
