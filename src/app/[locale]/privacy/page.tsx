"use client"

import { useTranslations } from "next-intl"
import React, { useState } from "react"
import { Shield, Lock, Eye, Trash2, Cpu, ChevronDown, ChevronUp, MapPin } from "lucide-react"

// Simple Accordion Component for the Layered Privacy Design
function PrivacySection({ title, summary, children, icon: Icon }: { title: string, summary: string, children: React.ReactNode, icon: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-secondary/20 bg-card rounded-[2rem] overflow-hidden transition-all duration-300 mb-6 shadow-sm hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-8 flex items-start gap-6 hover:bg-muted/30 transition-colors"
      >
        <div className={`p-4 rounded-2xl transition-all ${isOpen ? 'bg-primary text-secondary' : 'bg-secondary/10 text-secondary'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
           <h3 className="text-xl font-bold text-primary font-playfair mb-1">{title}</h3>
           <p className="text-sm text-primary/60 font-sans leading-relaxed">{summary}</p>
        </div>
        <div className="mt-2 text-primary/30">
          {isOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
          <div className="h-px bg-secondary/10 w-full mb-6" />
          <div className="prose prose-slate max-w-none text-primary/80 text-sm leading-relaxed space-y-4 font-sans">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PrivacyPage() {
  const t = useTranslations("Privacy")

  const sections = ["collection", "thirdParty", "ai", "rights", "contact"] as const

  const richTextConfig = {
    p: (chunks: React.ReactNode) => <p className="mb-4 last:mb-0">{chunks}</p>,
    ul: (chunks: React.ReactNode) => <ul className="list-disc pl-5 space-y-2 mb-4">{chunks}</ul>,
    li: (chunks: React.ReactNode) => <li>{chunks}</li>,
    strong: (chunks: React.ReactNode) => <strong className="font-semibold text-primary">{chunks}</strong>,
    br: () => <br />,
    contact: (chunks: React.ReactNode) => (
      <p className="bg-muted p-4 rounded-xl font-mono text-primary/80 border border-secondary/10 mt-2">
        {chunks}
      </p>
    )
  }

  const icons = {
    collection: Eye,
    thirdParty: MapPin,
    ai: Cpu,
    rights: Trash2,
    contact: Lock
  }

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Header */}
      <section className="bg-background pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-black text-primary mb-6">{t("title")}</h1>
            <p className="text-secondary font-bold tracking-[0.2em] text-xs uppercase mb-12">{t("subtitle")}</p>
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-primary text-white rounded-full text-sm font-bold shadow-2xl">
              <Shield className="h-5 w-5 text-secondary" />
              <span>{t("shield")}</span>
            </div>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4">
        {sections.map(section => (
          <PrivacySection 
            key={section}
            title={t(`sections.${section}.title`)} 
            summary={t(`sections.${section}.summary`)} 
            icon={icons[section]}
          >
           {t.rich(`sections.${section}.content`, richTextConfig)}
          </PrivacySection>
        ))}
      </div>
    </div>
  )
}
