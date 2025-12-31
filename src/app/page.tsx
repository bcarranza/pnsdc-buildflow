import Link from "next/link"
import { Heart } from "lucide-react"
import { Header, ContactInfo, RealtimeDashboard, type Material, type Donation } from "@/components/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getDashboardData() {
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
      .limit(100), // Increased for client-side filtering
  ])

  // Transform donations to flatten material name
  const donations: Donation[] = (donationsResult.data || []).map((d) => ({
    id: d.id,
    donor_name: d.donor_name,
    is_anonymous: d.is_anonymous,
    amount: d.amount,
    created_at: d.created_at,
    material_name: (d.materials as { name: string } | null)?.name || null,
  }))

  // Transform materials
  const materials: Material[] = (materialsResult.data || []).map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    quantity_needed: m.quantity_needed,
    quantity_current: m.quantity_current,
  }))

  return {
    fundraising: {
      current_amount: goalResult.data?.current_amount || 0,
      goal_amount: goalResult.data?.goal_amount || 1000000,
    },
    materials,
    donations,
    error: goalResult.error || materialsResult.error || donationsResult.error,
  }
}

export default async function Home() {
  const { fundraising, materials, donations, error } = await getDashboardData()

  if (error) {
    console.error('Dashboard data fetch error:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-carmelite-50 to-white flex flex-col">
      <Header />

      {/* Donation CTA */}
      <div className="container mx-auto px-4 pt-6 max-w-4xl">
        <Link href="/donar" className="block">
          <Button className="w-full bg-carmelite-500 hover:bg-carmelite-600 text-white font-semibold min-h-[56px] text-lg shadow-lg hover:shadow-xl transition-all">
            <Heart className="mr-2 h-5 w-5" />
            Registrar mi Donación
          </Button>
        </Link>
      </div>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl flex-1">
        {/* Realtime Dashboard with Thermometer, Materials, and Donor Wall */}
        <RealtimeDashboard
          initialFundraising={fundraising}
          initialMaterials={materials}
          initialDonations={donations}
        />

        {/* Contact Section */}
        <section aria-label="Información de contacto">
          <Card className="border-carmelite-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-carmelite-800">
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactInfo />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm border-t border-carmelite-100">
        <p>© 2025 Parroquia Nuestra Señora del Carmen</p>
        <p className="mt-1">Construyendo juntos un espacio para nuestra comunidad</p>
      </footer>
    </div>
  )
}
