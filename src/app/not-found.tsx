import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-carmelite-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 bg-carmelite-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-carmelite-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8">
          Lo sentimos, la página que busca no existe o ha sido movida.
        </p>

        <Link href="/">
          <Button className="bg-carmelite-500 hover:bg-carmelite-600 text-white">
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
