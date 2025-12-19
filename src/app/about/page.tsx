import { Metadata } from "next"
import Image from "next/image"
import { Check, Shield, Map as MapIcon, Compass } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | Azen",
  description: "Learn about Azen's mission to bridge the gap between travelers and the authentic heart of Japan.",
}

export default function AboutPage() {
  const team = [
    { name: "Takashi Sato", role: "Local Expert & Founder", bio: "Born and raised in Kyoto, Takashi spent 15 years in hospitality before founding Azen." },
    { name: "Elena Chen", role: "Experience Specialist", bio: "A culture enthusiast who specializes in finding hidden culinary gems across Tokyo." },
    { name: "Hiroki Tanaka", role: "Technology Lead", bio: "Bridging the gap between traditional wisdom and modern travel tech." }
  ]

  const values = [
    { 
      title: "Authenticity", 
      desc: "No tourist traps. We only recommend places we and our local guides truly love.",
      icon: <Compass className="h-8 w-8 text-secondary" />
    },
    { 
      title: "Transparency", 
      desc: "Clear pricing, honest reviews, and no hidden agendas. Trust is our foundation.",
      icon: <Shield className="h-8 w-8 text-secondary" />
    },
    { 
      title: "Local Expertise", 
      desc: "Our knowledge comes from streets, not just search engines. We live where you travel.",
      icon: <MapIcon className="h-8 w-8 text-secondary" />
    }
  ]

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/40 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale-[20%] scale-105" />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-playfair font-black text-white mb-6 drop-shadow-2xl">
            Our Mission in Japan
          </h1>
          <p className="text-xl md:text-2xl font-sans text-white/90 leading-relaxed font-light italic">
            "Eliminating the friction between the traveler and the soul of Japan."
          </p>
        </div>
      </section>

      {/* The Context/Problem Section */}
      <section className="py-20 px-4 md:px-0">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center font-sans">
            <div>
               <h2 className="text-3xl md:text-4xl font-playfair font-black text-primary mb-6">
                Why Azen Exists
              </h2>
              <div className="space-y-4 text-primary/80 leading-relaxed">
                <p>
                  Japan is a land of beautiful complexity. From the intricate etiquette of tea ceremonies to the maze-like streets of Shinjuku, it's easy for travelers to feel overwhelmed.
                </p>
                <p>
                  Most travel platforms provide generic "top 10" lists that lead to crowded tourist traps. We believe there's a better way to experience the archipelago.
                </p>
                <p className="font-bold border-l-4 border-accent pl-4 italic">
                  Azen was built to bring "Zen" to your "A to Z" travel planning. We combine cutting-edge technology with deep-rooted local wisdom.
                </p>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden border-8 border-white shadow-2xl rotate-2">
               <div className="absolute inset-0 bg-secondary/10" />
               <img src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop" alt="The Spirit of Zen" className="object-cover h-full w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-primary py-24 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-black mb-4 uppercase tracking-widest">Our Shared Values</h2>
            <div className="h-1 w-20 bg-secondary mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {values.map((v, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="mb-6 p-6 rounded-full bg-white/5 border border-white/10 group-hover:bg-secondary/20 transition-all duration-300">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 font-playfair">{v.title}</h3>
                <p className="text-white/70 leading-relaxed max-w-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Bios */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
           <div className="flex flex-col items-center mb-16">
             <h2 className="text-4xl font-playfair font-black text-primary mb-4">Meet the Concierges</h2>
             <p className="text-primary/60 font-sans tracking-widest uppercase text-xs">The faces behind the screen</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {team.map((person, i) => (
               <div key={i} className="bg-card p-8 rounded-3xl shadow-xl border border-secondary/10 hover:-translate-y-2 transition-transform duration-300 group">
                 <div className="relative w-24 h-24 mb-6 mx-auto">
                    <div className="absolute inset-0 bg-secondary rounded-full rotate-6 group-hover:rotate-12 transition-transform" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${person.name}`} alt={person.name} className="grayscale hover:grayscale-0 transition-all" />
                    </div>
                 </div>
                 <div className="text-center">
                    <h4 className="text-xl font-bold text-primary font-playfair">{person.name}</h4>
                    <p className="text-secondary font-bold text-xs uppercase tracking-tighter mb-4">{person.role}</p>
                    <p className="text-sm text-primary/70 leading-relaxed">{person.bio}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Trust Signal Footer */}
      <section className="py-16 bg-background">
        <div className="container mx-auto max-w-4xl text-center px-4">
           <div className="inline-flex items-center gap-2 mb-8 px-6 py-2 bg-secondary/10 text-secondary rounded-full font-bold text-sm uppercase tracking-widest border border-secondary/20">
              <Check className="h-4 w-4" />
              Verified Local Guides only
           </div>
           <p className="text-2xl font-playfair italic text-primary/80">
            "We don't just book trips. We build connections that last a lifetime."
           </p>
        </div>
      </section>
    </div>
  )
}
