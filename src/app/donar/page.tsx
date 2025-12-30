import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DonationForm } from "@/components/donation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getMaterials() {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("materials")
    .select("id, name, unit, quantity_needed, quantity_current")
    .order("name")

  if (error) {
    console.error("Error fetching materials:", error)
    return []
  }

  return data || []
}

export default async function DonarPage() {
  const materials = await getMaterials()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors min-h-[48px] min-w-[48px] justify-center"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-amber-800">
                Registrar Donación
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Parroquia Nuestra Señora del Carmen
              </p>
            </div>
            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-md flex-1">
        <DonationForm materials={materials} />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-xs border-t border-amber-100">
        <p>© 2025 Parroquia Nuestra Señora del Carmen</p>
      </footer>
    </div>
  )
}

export const metadata = {
  title: "Registrar Donación | Parroquia Nuestra Señora del Carmen",
  description: "Registra tu donación para la construcción del nuevo salón parroquial",
}
