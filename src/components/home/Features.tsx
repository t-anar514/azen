import { UserCheck, ShieldAlert, PiggyBank } from "lucide-react"

export function FeatureBlock() {
  const features = [
    {
      icon: UserCheck,
      title: "Real Local Guides",
      description: "Connect with verified residents, not scripted tour guides. Experience the authentic culture.",
    },
    {
      icon: ShieldAlert,
      title: "Tourist Trap Alerts",
      description: "Our database warns you about overpriced spots and suggests better, quieter alternatives.",
    },
    {
      icon: PiggyBank,
      title: "Smart Savings",
      description: "Built-in hacks and transport calculators to save you money on JR passes and entry fees.",
    },
  ]

  return (
    <section className="py-24 bg-muted">
      <div className="  px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-serif mb-4">The Azen Difference</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Why travelers choose us over generic wikis and tourist traps.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 bg-card rounded-2xl shadow-sm border border-secondary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-14 w-14 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
