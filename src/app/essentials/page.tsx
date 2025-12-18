import { CITIES } from "@/data/cities"
import { CityCard } from "@/components/essentials/CityCard"

export default function EssentialsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
            Japan Essentials
          </h1>
          <p className="text-lg text-muted-foreground">
            Master the logistics of travel across Japan's most iconic cities. From local transport hacks to neighborhood guides, we've got you covered.
          </p>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full" />
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CITIES.map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </section>
        
        <footer className="mt-20 pt-8 border-t border-secondary/20 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Azen Travel Guide. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
