export function Header() {
  return (
    <header className="bg-amber-600 text-white py-6 shadow-lg">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Parroquia Nuestra Señora del Carmen
        </h1>
        <p className="text-amber-100 mt-1 text-sm md:text-base">
          Jalapa, Guatemala
        </p>
        <div className="mt-3 pt-3 border-t border-amber-500/30">
          <p className="text-lg md:text-xl font-medium">
            Construcción del Nuevo Salón Parroquial
          </p>
        </div>
      </div>
    </header>
  )
}
