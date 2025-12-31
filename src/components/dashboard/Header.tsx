export function Header() {
  return (
    <header className="bg-gradient-to-r from-carmelite-700 via-carmelite-600 to-carmelite-700 text-white py-6 shadow-lg relative overflow-hidden">
      {/* Subtle cross pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M27 0h6v60h-6zM0 27h60v6H0z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: '30px 30px'
      }} aria-hidden="true" />
      <div className="container mx-auto px-4 text-center relative">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Parroquia Nuestra Señora del Carmen
        </h1>
        <p className="text-carmelite-100 mt-1 text-sm md:text-base">
          Jalapa, Guatemala
        </p>
        <div className="mt-3 pt-3 border-t border-gold-400/30">
          <p className="text-lg md:text-xl font-medium text-gold-400">
            Construcción del Nuevo Salón Parroquial
          </p>
        </div>
      </div>
    </header>
  )
}
