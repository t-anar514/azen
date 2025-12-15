import { ESimCalculator } from "@/components/essentials/ESimCalculator"
import { TransportGuide } from "@/components/essentials/TransportGuide"

export default function EssentialsPage() {
  return (
    <div className="container py-8 px-4 md:px-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-4">Essentials & Logistics</h1>
        <p className="text-muted-foreground max-w-2xl">
          Everything you need to survive the chaos of Tokyo transport and connectivity.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">eSIM Recommendations</h2>
        <ESimCalculator />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Transport Explained</h2>
        <TransportGuide />
      </section>
    </div>
  )
}
