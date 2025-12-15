import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Map } from "lucide-react"

export function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center py-20 md:py-32 text-center bg-gradient-to-b from-primary/5 to-transparent overflow-hidden">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary font-medium mb-6 animate-fade-in-up">
          New: AI-Powered Itinerary Builder
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-primary mb-8 animate-fade-in-up delay-100 font-serif">
          Don&apos;t Just Visit Japan. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary italic pr-2">
            Understand It.
          </span>
        </h1>
        <p className="max-w-[700px] mx-auto text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200">
          Avoid tourist traps. Discover hidden gems. Travel like a local with Azen&apos;s curated guides and smart itinerary planner.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
          <Button asChild size="lg" className="rounded-full h-12 px-8 text-lg">
            <Link href="/guides">
              Find a Local Guide <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-8 text-lg">
            <Link href="/planner">
              <Map className="mr-2 h-4 w-4" /> Start Planning Free
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  )
}
