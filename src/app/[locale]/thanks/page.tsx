"use client"

import { useTranslations } from "next-intl"
import { CheckCircle2, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ThanksPage() {
  const t = useTranslations("Contact")

  return (
    <div className="min-h-[90vh] bg-background flex items-center justify-center px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-card rounded-[3rem] shadow-2xl p-12 md:p-16 text-center border-2 border-accent/20 relative overflow-hidden"
      >
        {/* Background Decorative Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="h-12 w-12 text-accent" />
        </div>

        <h1 className="text-4xl md:text-5xl font-playfair font-black text-primary mb-6 italic">
          {t("success.title")}
        </h1>
        
        <p className="text-primary/70 text-lg mb-12 leading-relaxed max-w-md mx-auto">
          {t("success.message")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-14 font-black uppercase tracking-widest flex gap-2">
            <Link href="/">
              <Home className="h-4 w-4" /> Go Home
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="border-secondary text-secondary hover:bg-secondary/5 rounded-full px-8 h-14 font-black uppercase tracking-widest flex gap-2">
            <Link href="/essentials">
              Explore Japan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <p className="mt-12 text-[10px] text-primary/30 uppercase tracking-[0.3em] font-black">
          Azen Travel &bull; Kyoto &bull; Tokyo &bull; Osaka
        </p>
      </motion.div>
    </div>
  )
}
